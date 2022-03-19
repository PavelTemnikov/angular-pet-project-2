import { Observable } from 'rxjs';
import { AuthenticationService  } from '../_services/authentication.service';

export function appInitializer(authenticationService: AuthenticationService): () => Observable<void> {
    return () => authenticationService.refreshToken();
}