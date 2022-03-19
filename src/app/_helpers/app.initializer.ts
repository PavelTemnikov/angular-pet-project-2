import { Observable } from 'rxjs';
import { AuthenticationService  } from '../_services';

export function appInitializer(authenticationService: AuthenticationService): () => Observable<void> {
    return () => authenticationService.refreshToken();
}