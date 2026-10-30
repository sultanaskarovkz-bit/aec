<?php
/**
 * Только для локальной проверки сборки (в архив не входит):
 *   php -S 127.0.0.1:8793 -t build/aecups.kz tools/hosting/dev-router.php
 * Повторяет правила RewriteRule из .htaccess: 301, 410, внутренние подмены адресов, 404.html.
 */
$root = rtrim($_SERVER['DOCUMENT_ROOT'], '/\\');
$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($uri === '/send.php') return false;

$rules = [];
$prevCond = false;
foreach (file($root . '/.htaccess') as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') continue;
    if (stripos($line, 'RewriteCond') === 0) { $prevCond = true; continue; }
    if (preg_match('/^RewriteRule\s+(\S+)\s+(\S+)(?:\s+\[([^\]]+)\])?$/', $line, $m)) {
        if (!$prevCond) $rules[] = [$m[1], $m[2], isset($m[3]) ? $m[3] : ''];
        $prevCond = false;
        continue;
    }
    $prevCond = false;
}
$path = ltrim($uri, '/');
foreach ($rules as [$pat, $to, $flags]) {
    if (!preg_match('#' . str_replace('#', '\#', $pat) . '#u', $path, $mm)) continue;
    if (strpos($flags, 'G') !== false) { http_response_code(410); echo 'Gone'; return true; }
    for ($i = 1; $i < count($mm); $i++) $to = str_replace('$' . $i, $mm[$i], $to);
    if (strpos($flags, 'R=301') !== false) { header('Location: ' . $to, true, 301); return true; }
    if ($to !== '-') { $uri = $to; }
    break;
}
$file = $root . $uri;
if (is_dir($file)) {
    if (substr($uri, -1) !== '/') { header('Location: ' . $uri . '/', true, 301); return true; }
    $file .= 'index.html';
}
$types = ['html' => 'text/html; charset=utf-8', 'css' => 'text/css', 'js' => 'application/javascript', 'json' => 'application/json', 'svg' => 'image/svg+xml',
          'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'gif' => 'image/gif', 'ico' => 'image/x-icon', 'pdf' => 'application/pdf',
          'xml' => 'application/xml', 'txt' => 'text/plain; charset=utf-8', 'woff2' => 'font/woff2'];
if (!is_file($file) || preg_match('#/(leads|\.ht)#', $uri) || preg_match('#send-config\.php$#', $uri)) {
    http_response_code(preg_match('#/(leads|\.ht)|send-config#', $uri) ? 403 : 404);
    header('Content-Type: text/html; charset=utf-8');
    readfile($root . '/404.html');
    return true;
}
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
readfile($file);
return true;
