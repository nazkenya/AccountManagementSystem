<?php
$user = 'pmsdbs';
$pass = 'telkom#2015';
$tns = '(DESCRIPTION =
  (ADDRESS = (PROTOCOL = TCP)(HOST = 10.62.165.144)(PORT = 1521))
  (CONNECT_DATA = (SID = DADBS))
)';

$conn = oci_connect($user, $pass, $tns);

if (!$conn) {
    $e = oci_error();
    die("❌ Gagal konek: " . $e['message']);
}

echo "✅ Berhasil konek ke Oracle!";
oci_close($conn);
?>
