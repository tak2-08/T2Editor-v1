<?php
include_once('../../../common.php');

$uid = isset($_POST['uid']) ? $_POST['uid'] : '';
if (!$uid) {
    die(json_encode(['success' => false, 'message' => '잘못된 접근입니다.']));
}

$upload_dir = G5_DATA_PATH.'/editor/'.substr($uid, 0, 2);
$upload_url = G5_DATA_URL.'/editor/'.substr($uid, 0, 2);

if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, G5_DIR_PERMISSION);
    @chmod($upload_dir, G5_DIR_PERMISSION);
}

$uploaded_files = [];
$file_count = count($_FILES['bf_file']['name']);

for ($i = 0; $i < $file_count; $i++) {
    $file = $_FILES['bf_file']['tmp_name'][$i];
    $filename = $_FILES['bf_file']['name'][$i];

    if (!isset($filename) || empty($filename)) {
        continue;
    }

    if (!preg_match("/\.(jpg|jpeg|gif|png)$/i", $filename)) {
        continue;
    }

    $file_ext = pathinfo($filename, PATHINFO_EXTENSION);
    $save_filename = $uid.'_'.$i.'.'.$file_ext;
    $save_filepath = $upload_dir.'/'.$save_filename;

    if (move_uploaded_file($file, $save_filepath)) {
        @chmod($save_filepath, G5_FILE_PERMISSION);
        
        $size = getimagesize($save_filepath);
        $uploaded_files[] = [
            'url' => $upload_url.'/'.$save_filename,
            'width' => $size[0],
            'height' => $size[1]
        ];
    }
}

if (empty($uploaded_files)) {
    die(json_encode(['success' => false, 'message' => '업로드된 이미지가 없습니다.']));
}

die(json_encode([
    'success' => true,
    'files' => $uploaded_files
]));