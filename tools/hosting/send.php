<?php
/**
 * Заявки с сайта aecups.kz: Telegram + e-mail + журнал заявок (leads/leads.csv).
 * Настройки: send-config.php (рядом с этим файлом). Ответ: JSON {"ok": true|false}.
 * Если не сработал ни один канал, сайт предложит посетителю отправить ту же заявку в WhatsApp.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

$cfg = [
    'email_to'    => 'info@aecups.kz',   // куда приходят заявки (можно несколько через запятую)
    'email_from'  => 'site@aecups.kz',   // от кого (ящик на домене aecups.kz, чтобы письма не попадали в спам)
    'tg_token'    => '',                 // токен Telegram-бота от @BotFather
    'tg_chat'     => '',                 // id чата или группы, куда бот пишет заявки
    'max_file_mb' => 20,
    'log'         => __DIR__ . '/leads/leads.csv',
];
if (is_file(__DIR__ . '/send-config.php')) {
    $over = include __DIR__ . '/send-config.php';
    if (is_array($over)) $cfg = array_merge($cfg, $over);
}

function out($ok, $code = 200, $err = '') { http_response_code($code); echo json_encode($err ? ['ok' => $ok, 'error' => $err] : ['ok' => $ok], JSON_UNESCAPED_UNICODE); exit; }
function cut($s, $n) { $s = trim(strip_tags((string) $s)); return function_exists('mb_substr') ? mb_substr($s, 0, $n, 'UTF-8') : substr($s, 0, $n * 2); }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 405, 'method');
// ловушка для ботов: поле website скрыто от людей
if (!empty($_POST['website'])) out(true);

// не чаще 8 заявок за 10 минут с одного адреса
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) @mkdir($dir, 0750, true);
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$ip = trim(explode(',', $ip)[0]);
$rateFile = $dir . '/rate-' . md5($ip) . '.txt';
$now = time();
$hits = is_file($rateFile) ? array_filter(array_map('intval', explode(',', (string) @file_get_contents($rateFile))), function ($t) use ($now) { return $t > $now - 600; }) : [];
if (count($hits) >= 8) out(false, 429, 'rate');
$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits));

$LABELS = [
    'formType' => 'Тип заявки', 'product' => 'Товар', 'name' => 'Имя', 'phone' => 'Телефон', 'contact' => 'Контакт', 'email' => 'E-mail',
    'company' => 'Компания', 'bin' => 'БИН', 'city' => 'Город', 'topic' => 'Тема', 'model' => 'Модель', 'equipment' => 'Оборудование',
    'load' => 'Нагрузка', 'qty' => 'Количество', 'comment' => 'Комментарий', 'items' => 'Позиции для КП',
    'page_url' => 'Страница', 'page_title' => 'Заголовок страницы', 'utm' => 'Реклама (UTM)', 'referrer' => 'Источник перехода',
];
$SKIP = ['website', 'elapsed', 'page'];
$data = [];
foreach ($LABELS as $k => $label) {
    if (isset($_POST[$k]) && trim((string) $_POST[$k]) !== '') $data[$k] = cut($_POST[$k], $k === 'items' || $k === 'comment' ? 4000 : 500);
}
foreach ($_POST as $k => $v) {
    if (isset($data[$k]) || in_array($k, $SKIP, true) || isset($LABELS[$k]) || !is_string($v) || trim($v) === '') continue;
    $data[preg_replace('/[^a-zA-Z0-9_]/', '', $k)] = cut($v, 500);
}
$digits = preg_replace('/\D/', '', ($data['phone'] ?? '') . ($data['contact'] ?? ''));
if (strlen($digits) < 10 && empty($data['email']) && empty($data['contact'])) out(false, 400, 'contact');
// слишком быстрое заполнение (меньше 2 секунд) почти всегда бот
if (isset($_POST['elapsed']) && (int) $_POST['elapsed'] < 2 && empty($data['items'])) out(true);

$type = $data['formType'] ?? 'Заявка с сайта';
$date = date('d.m.Y H:i');
$lines = [];
foreach ($data as $k => $v) $lines[] = ($LABELS[$k] ?? $k) . ': ' . $v;
$lines[] = 'IP: ' . $ip;
$lines[] = 'Время: ' . $date;
$text = $type . "\n\n" . implode("\n", $lines);

// файлы (ТЗ, спецификации, фото)
$files = [];
$allow = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'zip', 'rar', '7z'];
foreach ($_FILES as $f) {
    if (!is_array($f) || is_array($f['name'] ?? null)) continue;
    if (($f['error'] ?? 1) !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) continue;
    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allow, true) || $f['size'] > $cfg['max_file_mb'] * 1048576) continue;
    $files[] = ['path' => $f['tmp_name'], 'name' => preg_replace('/[^\w.\-() ]+/u', '_', basename($f['name'])), 'size' => $f['size']];
}
if ($files) $text .= "\nФайлы: " . implode(', ', array_map(function ($x) { return $x['name']; }, $files));

$sent = ['tg' => false, 'mail' => false, 'log' => false];

// 1. Telegram
if ($cfg['tg_token'] && $cfg['tg_chat'] && function_exists('curl_init')) {
    $api = 'https://api.telegram.org/bot' . $cfg['tg_token'] . '/';
    $msg = '🔔 ' . $text;
    if (function_exists('mb_strlen') && mb_strlen($msg, 'UTF-8') > 4000) $msg = mb_substr($msg, 0, 3990, 'UTF-8') . '…';
    $ch = curl_init($api . 'sendMessage');
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => ['chat_id' => $cfg['tg_chat'], 'text' => $msg, 'disable_web_page_preview' => 'true'], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12]);
    $res = json_decode((string) curl_exec($ch), true);
    curl_close($ch);
    $sent['tg'] = !empty($res['ok']);
    foreach ($files as $f) {
        $ch = curl_init($api . 'sendDocument');
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => ['chat_id' => $cfg['tg_chat'], 'caption' => $type . ': ' . ($data['name'] ?? '') . ' ' . ($data['phone'] ?? ''), 'document' => new CURLFile($f['path'], 'application/octet-stream', $f['name'])], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30]);
        curl_exec($ch);
        curl_close($ch);
    }
}

// 2. E-mail (с вложениями)
if ($cfg['email_to']) {
    $subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта aecups.kz: ' . $type) . '?=';
    $from = $cfg['email_from'] ?: 'site@aecups.kz';
    $headers = ['From: =?UTF-8?B?' . base64_encode('Сайт aecups.kz') . '?= <' . $from . '>', 'MIME-Version: 1.0'];
    if (!empty($data['email']) && filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $headers[] = 'Reply-To: ' . $data['email'];
    if ($files) {
        $b = 'b' . md5(uniqid('', true));
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $b . '"';
        $body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text)) . "\r\n";
        foreach ($files as $f) {
            $body .= "--$b\r\nContent-Type: application/octet-stream; name=\"=?UTF-8?B?" . base64_encode($f['name']) . "?=\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"=?UTF-8?B?" . base64_encode($f['name']) . "?=\"\r\n\r\n" . chunk_split(base64_encode((string) file_get_contents($f['path']))) . "\r\n";
        }
        $body .= "--$b--";
    } else {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: base64';
        $body = chunk_split(base64_encode($text));
    }
    $sent['mail'] = @mail($cfg['email_to'], $subject, $body, implode("\r\n", $headers), '-f' . $from);
}

// 3. Журнал заявок (закрыт от просмотра через .htaccess в папке leads)
if ($cfg['log']) {
    $new = !is_file($cfg['log']);
    $fh = @fopen($cfg['log'], 'a');
    if ($fh) {
        if ($new) fwrite($fh, "\xEF\xBB\xBF" . 'Дата;Тип;Имя;Телефон;E-mail;Компания;Товар;Комментарий;Позиции;Страница;UTM;Источник;IP' . "\n");
        $row = [$date, $type, $data['name'] ?? '', $data['phone'] ?? ($data['contact'] ?? ''), $data['email'] ?? '', $data['company'] ?? '', $data['product'] ?? '', $data['comment'] ?? '', $data['items'] ?? '', $data['page_url'] ?? '', $data['utm'] ?? '', $data['referrer'] ?? '', $ip];
        fputcsv($fh, $row, ';');
        fclose($fh);
        $sent['log'] = true;
    }
}

out($sent['tg'] || $sent['mail']);
