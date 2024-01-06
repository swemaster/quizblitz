import { CanActivateFn } from '@angular/router';

export const adminAuthGuard: CanActivateFn = () => {
    const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';

    if (isAdminAuthenticated) {
        sessionStorage.setItem('isAdminAuthenticated', 'false');
        return true;
    } else {
        window.alert("Vous ne pouvez pas accéder à cette page. Entrez d'abord le mot de passe administrateur.");
        window.location.href = '/#/password';
        return false;
    }
};
