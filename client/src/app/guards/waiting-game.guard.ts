import { CanActivateFn } from '@angular/router';

export const waitingGameGuard: CanActivateFn = () => {
    const playerAthenticated = sessionStorage.getItem('isPlayerAuthenticated') === 'true';

    if (playerAthenticated) {
        sessionStorage.setItem('isPlayerAthenticated', 'false');
        return true;
    } else {
        window.alert("Vous ne pouvez pas accéder à cette page. Entrez d'abord le code d'accces d'une partie.");
        window.location.href = '/#/joingame';
        return false;
    }
};
