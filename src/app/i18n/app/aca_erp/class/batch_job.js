// 자동 생성 · 원본: web/language/64/app/aca_erp/class/batch_job.json
// scripts/gen_i18n.py 로 재생성 — 직접 수정하지 말 것
const app_aca_erp_class_batch_job = {
  error_require_user_id: "학생id가 필요합니다.",
  error_require_from_class_id: "from반의 반id가 필요합니다.",
  error_require_to_class_id: "to반의 반id가 필요합니다.",
  error_require_date_moved: "전반일이 필요합니다.",
  error_require_class_id: "반id가 필요합니다.",
  error_require_date_closed: "퇴반날짜가 필요합니다.",
  error_require_close_reason_type: "퇴반사유가 필요합니다.",
  error_require_close_memo: "퇴반 메모가 필요합니다.",
  error_not_exist_class: "반이 존재하지 않습니다.",
  error_not_alive_class: "종강한 반에서는 퇴반처리 할 수 없습니다.",
  error_not_registered_class_so_cannot_dropping: "등록되지 않은 학생을 퇴반처리할 수 없습니다.",
  error_not_is_live_class_so_cannot_dropping: "수강중이 아닌 상태의 학생은 퇴반처리할 수 없습니다.",
  error_invalid_close_date_so_cannot_dropping: "퇴반날짜는 입반날짜 이후의 날짜이어야 합니다.",
  error_from_to_is_same_so_cannot_move: "같은 반으로 전반시킬 수 없습니다.",
  error_not_exist_from_class_so_cannot_move: "from반이 존재하지 않습니다.",
  error_not_live_from_class: "종강반의 학생을 전반시킬 수 없습니다.",
  error_not_exist_to_class_so_cannot_move: "to반이 존재하지 않습니다.",
  error_not_live_to_class: "종강반으로 학생을 전반시킬 수 없습니다.",
  error_not_exist_from_class_student: "from반에 등록되어 있지 않습니다.",
  error_not_live_from_class_student: "from반에 수강중 상태가 아닙니다.",
  error_invalid_start_type_from_class: "from반의 입반상태 오류입니다.",
  error_date_start_close_so_cannot_move: "전반일은 from반의 입반일보다 이후의 날짜이어야 합니다.",
  error_to_class_is_alive_so_cannot_move: "이미 수강중인 반으로 전반할 수 없습니다.",
  error_date_start_to_class_date_close_so_cannot_move: "전반일이 to반의 퇴반일보다 이후의 날짜이어야 합니다.",
  error_exist_payment_so_cannot_move: "납입일자가 전반일(포함)이후에 발생된 수강료에 payment가 발생했습니다.",
  error_not_save_message: "다음의 에러를 수정후 저장해주세요.",
  message_move_ok: "전반을 처리하였습니다.",
};

export default app_aca_erp_class_batch_job;
