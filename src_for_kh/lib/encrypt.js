const JSEncrypt = require('@/assets/js/lib/jsencrypt/jsencrypt');

export default {
    do(txt) {
        if (JSEncrypt) {
            const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTXX1iLhiMpI/m5UCYg/5vdFXu7OWFzfFKeOdwt5ySXRjCEGzKqcm3NhgUcY8ILpdqwWTay0EL1szToYUyso1XYcGDQ6cws330ur0zJDEH8AVC4Z+znDaK6aTQJiA7J38eOXp2hBMCA7IC5HgEC+/gvfGVYn1YEItTAPbRV2m47QIDAQAB';
            this.encr = new window.JSEncrypt(window);
            this.encr.setPublicKey(publicKey);
        }
        return (t => {     // 加密
            if (this.encr) {
                const Base64save = (ipt) => {
                    let input = ipt;
                    input = input || '';
                    return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                };

                return Base64save(this.encr.encrypt(t));
            } else {
                return t;
            }
        })(txt);
    },
};
