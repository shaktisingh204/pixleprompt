
'use server';

import {cookies} from 'next/headers';

const SESSION_COOKIE_NAME = 'session';

export async function getSessionCookie(): Promise<string | undefined> {
    return cookies().get(SESSION_COOKIE_NAME)?.value;
}
