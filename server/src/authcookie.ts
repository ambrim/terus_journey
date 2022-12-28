import Crypto from 'crypto';
import CookieSigner from 'cookie-signature';
import Cookie from 'cookie';

export class AuthCookie
{
    private secret;

    constructor()
    {
        this.secret = Crypto.randomBytes(32).toString('hex');
    }

    getAuth(cookie: string | undefined): string | null
    {
        console.log(cookie);
        if(cookie === undefined) return null;
        let userId;
        try
        {
            userId = CookieSigner.unsign(Cookie.parse(cookie).auth, this.secret);
        }
        catch
        {
            return null;
        }
        if(userId === false) return null;
        return userId;
    }

    makeCookie(userId: string)
    {
        return Cookie.serialize('auth', CookieSigner.sign(userId, this.secret), {
            secure: true,
            maxAge: 1000 * 60,
            path: '/',
            sameSite: 'strict',
        })
    }
}