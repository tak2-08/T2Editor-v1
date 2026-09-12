<?php
include_once('../../../common.php');

// 파일 권한 확인 및 설정 함수
function check_and_set_permission($file_path) {
    if (file_exists($file_path)) {
        // 현재 파일 권한 확인
        $current_perm = substr(sprintf('%o', fileperms($file_path)), -3);
        
        // 권한이 755가 아니면 설정
        if ($current_perm != '755') {
            // 755 권한 설정 (소유자:읽기,쓰기,실행 / 그룹:읽기,실행 / 기타:읽기,실행)
            @chmod($file_path, 0755);
        }
    }
    return true;
}

// 현재 스크립트의 경로 확인
$current_script_path = __FILE__;

// 권한 확인 및 설정
check_and_set_permission($current_script_path);

$uid = isset($_POST['uid']) ? $_POST['uid'] : '';
if (!$uid) {
    die(json_encode(['success' => false, 'message' => '잘못된 접근입니다.']));
}
// 현재 날짜로 폴더명 생성 (예: 250302)
$date_folder = date('ymd');
$upload_dir = G5_DATA_PATH . '/editor/' . $date_folder;
$upload_url = G5_DATA_URL . '/editor/' . $date_folder;
// 폴더가 없으면 생성
if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, G5_DIR_PERMISSION, true);
    @chmod($upload_dir, G5_DIR_PERMISSION);
}
$uploaded_files = [];
$file_count = count($_FILES['bf_file']['name']);
// webp 변환 품질 설정 (85%)
$webp_quality = 85;
for ($i = 0; $i < $file_count; $i++) {
    $file = $_FILES['bf_file']['tmp_name'][$i];
    $filename = $_FILES['bf_file']['name'][$i];
    if (!isset($filename) || empty($filename)) {
        continue;
    }
    // 이미지 파일 확장자 확인 (webp 추가)
    if (!preg_match("/\.(jpg|jpeg|gif|png|webp)$/i", $filename)) {
        continue;
    }
    // 원본 파일 확장자 추출
    $file_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    // 먼저 원본 파일을 임시 위치에 이동
    $temp_filepath = $upload_dir . '/temp_' . $uid . '_' . $i . '.' . $file_ext;
    if (!move_uploaded_file($file, $temp_filepath)) {
        continue; // 파일 업로드 실패 시 다음 파일로
    }
    
    // 원본 이미지 정보 가져오기
    $image_info = @getimagesize($temp_filepath);
    if (!$image_info) {
        // 이미지 정보를 가져올 수 없는 경우 원본 파일 삭제 후 다음 파일로
        @unlink($temp_filepath);
        continue;
    }
    
    // 이미 WebP 형식인 경우 변환하지 않고 그대로 사용
    if ($file_ext === 'webp') {
        $save_filename = $uid . '_' . $i . '.webp';
        $save_filepath = $upload_dir . '/' . $save_filename;
        
        // 임시 파일을 최종 위치로 이동
        if (@rename($temp_filepath, $save_filepath)) {
            @chmod($save_filepath, G5_FILE_PERMISSION);
            
            $uploaded_files[] = [
                'url' => $upload_url . '/' . $save_filename,
                'width' => $image_info[0],
                'height' => $image_info[1]
            ];
        } else {
            // 이동 실패 시 임시 파일 삭제
            @unlink($temp_filepath);
        }
        continue; // 다음 파일로
    }
    
    // WebP가 아닌 이미지 형식을 WebP로 변환
    // 파일명 생성 (UID_인덱스.webp)
    $save_filename = $uid . '_' . $i . '.webp';
    $save_filepath = $upload_dir . '/' . $save_filename;
    
    // 이미지 타입 확인
    $success = false;
    
    // 이미지 리소스 생성
    $src_image = null;
    switch ($file_ext) {
        case 'jpg':
        case 'jpeg':
            $src_image = @imagecreatefromjpeg($temp_filepath);
            break;
        case 'png':
            $src_image = @imagecreatefrompng($temp_filepath);
            if ($src_image) {
                // PNG 투명 배경 처리
                imagepalettetotruecolor($src_image);
                imagealphablending($src_image, false);
                imagesavealpha($src_image, true);
            }
            break;
        case 'gif':
            $src_image = @imagecreatefromgif($temp_filepath);
            break;
    }
    // 이미지 리소스 생성 확인
    if ($src_image) {
        // WebP 형식으로 저장 시도
        $success = @imagewebp($src_image, $save_filepath, $webp_quality);
        imagedestroy($src_image);
        
        if ($success) {
            // WebP 저장 성공 시 처리
            @chmod($save_filepath, G5_FILE_PERMISSION);
            
            // 원본 이미지 크기 사용 (WebP 변환 후에도 크기는 동일)
            $uploaded_files[] = [
                'url' => $upload_url . '/' . $save_filename,
                'width' => $image_info[0],
                'height' => $image_info[1]
            ];
            
            // 임시 파일 삭제
            @unlink($temp_filepath);
            continue; // 다음 파일로
        }
    }
    // WebP 변환 실패 시 원본 이미지 사용
    $org_save_filename = $uid . '_' . $i . '.' . $file_ext;
    $org_save_filepath = $upload_dir . '/' . $org_save_filename;
    
    // 임시 파일을 최종 위치로 이동
    if (@rename($temp_filepath, $org_save_filepath)) {
        @chmod($org_save_filepath, G5_FILE_PERMISSION);
        
        $uploaded_files[] = [
            'url' => $upload_url . '/' . $org_save_filename,
            'width' => $image_info[0],
            'height' => $image_info[1]
        ];
    } else {
        // 이동 실패 시 임시 파일 삭제
        @unlink($temp_filepath);
    }
}
if (empty($uploaded_files)) {
    die(json_encode(['success' => false, 'message' => '업로드된 이미지가 없습니다.']));
}
die(json_encode([
    'success' => true,
    'files' => $uploaded_files
]));
?>