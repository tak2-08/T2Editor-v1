<?php
include_once('../../../common.php');
$uid = isset($_POST['uid']) ? $_POST['uid'] : '';
if (!$uid) {
    die(json_encode(['success' => false, 'message' => '잘못된 접근입니다.']));
}

// 폴더명 생성: t2editor_YYYYMMDD 형식
$folder_name = 't2editor_' . date('Ymd');
$upload_dir = G5_DATA_PATH.'/editor/'.$folder_name;
$upload_url = G5_DATA_URL.'/editor/'.$folder_name;

// 디렉토리가 없으면 생성
if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, G5_DIR_PERMISSION, true); // recursive 옵션 추가
    @chmod($upload_dir, G5_DIR_PERMISSION);
}

$allowed_types = ['zip', 'pdf', 'txt', 'mp3', 'm4a'];
$file = $_FILES['bf_file'];

if (!isset($file) || empty($file['name'])) {
    die(json_encode(['success' => false, 'message' => '파일이 없습니다.']));
}

$filename = $file['name'];
$file_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

if (!in_array($file_ext, $allowed_types)) {
    die(json_encode(['success' => false, 'message' => '지원하지 않는 파일 형식입니다.']));
}

$save_filename = $uid.'_'.time().'.'.$file_ext;
$save_filepath = $upload_dir.'/'.$save_filename;

if (move_uploaded_file($file['tmp_name'], $save_filepath)) {
    @chmod($save_filepath, G5_FILE_PERMISSION);
    
    die(json_encode([
        'success' => true,
        'file' => [
            'url' => $upload_url.'/'.$save_filename,
            'original_name' => $filename,
            'size' => $file['size'],
            'type' => $file_ext
        ]
    ]));
} else {
    die(json_encode(['success' => false, 'message' => '파일 업로드에 실패했습니다.']));
}