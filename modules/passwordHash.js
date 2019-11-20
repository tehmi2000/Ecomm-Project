const model = function() {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';

    return {
        softEncrypt: function(password) {
            const iv = crypto.randomBytes(16);
            const key = crypto.randomBytes(32);
        
            let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
            let encrypted = cipher.update(password);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
                
            return `${iv.toString('hex')}${encrypted.toString('hex')}${key.toString('hex')}`;
        },
        
        encrypt: function(password) {
            const iv = crypto.randomBytes(16); // Generates a buffer
            const key = crypto.randomBytes(32);
        
            let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
            let encrypted = cipher.update(password);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
                
            return `${iv.toString('hex')}h${encrypted.toString('hex')}h${key.toString('hex')}`;
        },

        decrypt: function (encryptedpassword){
            let [iv, encrypted, key] = encryptedpassword.split('h');
            iv = Buffer.from(iv, 'hex');
            encrypted = Buffer.from(encrypted, 'hex');
            key = Buffer.from(key, 'hex');
        
            let decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted);
        
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        }
    };
};

module.exports = model();
