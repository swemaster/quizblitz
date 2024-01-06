import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { OrgQrlComponent } from '@app/components/org-qrl/org-qrl.component';
import { adminAuthGuard } from '@app/guards/admin-auth.guard';
import { waitingGameGuard } from '@app/guards/waiting-game.guard';
import { AdminEditgamePageComponent } from '@app/pages/admin-editgame-page/admin-editgame-page.component';
import { AdminGamePageComponent } from '@app/pages/admin-game-page/admin-game-page.component';
import { AdminHistoryPageComponent } from '@app/pages/admin-history-page/admin-history-page.component';
import { AdminPasswordComponent } from '@app/pages/admin-password-page/admin-password-page.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { FromWaitingToOrgPageComponent } from '@app/pages/from-waiting-to-org-page/from-waiting-to-org-page.component';
import { FromWaitingToPlayPageComponent } from '@app/pages/from-waiting-to-play-page/from-waiting-to-play-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { JoinGamePageComponent } from '@app/pages/join-game-page/join-game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { OrgGamePageComponent } from '@app/pages/org-game-page/org-game-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { WaitingForGameStartComponent } from '@app/pages/waiting-for-game-start/waiting-for-game-start.component';
import { WaitingForPlayersPageComponent } from '@app/pages/waiting-for-players-page/waiting-for-players-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'admin', component: AdminGamePageComponent, canActivate: [adminAuthGuard] },
    { path: 'password', component: AdminPasswordComponent },
    { path: 'history', component: AdminHistoryPageComponent, canActivate: [adminAuthGuard] },
    { path: 'material', component: MaterialPageComponent },
    { path: 'editgame/:id', component: AdminEditgamePageComponent, canActivate: [adminAuthGuard] },
    { path: 'orggame/:id', component: OrgGamePageComponent },
    { path: 'creategame', component: CreateGamePageComponent },
    { path: 'results', component: ResultPageComponent },
    { path: 'question', component: PlayerPageComponent },
    { path: 'test', component: TestPageComponent },
    { path: 'waitingplayers/:accessCode', component: WaitingForPlayersPageComponent, canActivate: [waitingGameGuard] },
    { path: 'joingame', component: JoinGamePageComponent },
    { path: 'fromwaitingtoplay/:accessCode', component: FromWaitingToPlayPageComponent },
    { path: 'waitinggame/:accessCode', component: WaitingForGameStartComponent, canActivate: [waitingGameGuard] },
    { path: 'testchat', component: ChatComponent },
    { path: 'eval', component: OrgQrlComponent },
    { path: 'testresults', component: ResultPageComponent },
    { path: 'fromwaitingtoorg/:accessCode', component: FromWaitingToOrgPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
