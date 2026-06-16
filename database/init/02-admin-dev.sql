UPDATE `user`
SET
  `password` = '$2b$10$.GSEIRFisZyOhRbbLWFTIu0b3QDSQaoPmEv5nbus6dIhz9HyFdZJW',
  `role` = 0,
  `del_flag` = 0,
  `updated_date` = NOW()
WHERE `username` = 'demo';
