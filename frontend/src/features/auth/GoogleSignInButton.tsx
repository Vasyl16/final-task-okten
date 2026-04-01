import { GoogleLogin } from '@react-oauth/google';
import { getGoogleClientId } from '@/shared/lib/runtime-env';

type GoogleSignInButtonProps = {
  disabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
};

export function GoogleSignInButton({
  disabled = false,
  onCredential,
}: GoogleSignInButtonProps) {
  const clientId = getGoogleClientId();

  if (!clientId) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
        Google-вхід вимкнено: у{' '}
        <code className="rounded bg-muted px-1">frontend/.env</code> додайте{' '}
        <code className="rounded bg-muted px-1">VITE_GOOGLE_CLIENT_ID</code> (не{' '}
        <code className="rounded bg-muted px-1">GOOGLE_CLIENT_ID</code>) і
        перезапустіть <code className="rounded bg-muted px-1">npm run dev</code>
        .
      </p>
    );
  }

  return (
    <div
      className={[
        'flex w-full justify-center ',
        disabled ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const credential = credentialResponse.credential;

          if (credential) {
            await onCredential(credential);
          }
        }}
        onError={() => undefined}
        useOneTap={false}
        text="continue_with"
        shape="rectangular"
        size="large"
        width="384"
      />
    </div>
  );
}
