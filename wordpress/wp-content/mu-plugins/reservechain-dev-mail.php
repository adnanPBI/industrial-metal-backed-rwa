<?php
/** Development-only Mailpit SMTP bridge. */
if (!defined('ABSPATH')) { exit; }
if (getenv('RC_DEV_MAILPIT') === '1') {
    add_action('phpmailer_init', function ($phpmailer) {
        $phpmailer->isSMTP();
        $phpmailer->Host = 'mailpit';
        $phpmailer->Port = 1025;
        $phpmailer->SMTPAuth = false;
        $phpmailer->SMTPSecure = '';
        $phpmailer->SMTPAutoTLS = false;
        $phpmailer->From = 'noreply@reservechain.local';
        $phpmailer->FromName = 'ReserveChain Development';
    });
}
