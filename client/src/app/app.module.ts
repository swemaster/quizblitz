import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from '@app/components/app/app.component';
import { ChatBarComponent } from '@app/components/chat-bar/chat-bar.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { ChoiceComponent } from '@app/components/choice/choice.component';
import { GameComponent } from '@app/components/game/game.component';
import { HistogramQCMComponent } from '@app/components/histogram-qcm/histogram-qcm.component';
import { HistogramQRLResultsComponent } from '@app/components/histogram-qrl-results/histogram-qrl-results.component';
import { HistogramQRLComponent } from '@app/components/histogram-qrl/histogram-qrl.component';
import { HistogramSwitcherComponent } from '@app/components/histogram-switcher/histogram-switcher.component';
import { HistoryComponent } from '@app/components/history/history.component';
import { NavbarComponent } from '@app/components/navbar/navbar.component';
import { OrgQrlContainerComponent } from '@app/components/org-qrl-container/org-qrl-container.component';
import { OrgQrlComponent } from '@app/components/org-qrl/org-qrl.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { QuestionInGameComponent } from '@app/components/question-in-game/question-in-game.component';
import { EditQuestionQCMComponent } from '@app/components/question/qcm/edit-question-qcm.component';
import { EditQuestionQRLComponent } from '@app/components/question/qrl/edit-question-qrl.component';
import { ScorerComponent } from '@app/components/scorer/scorer.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { StatsQRLComponent } from '@app/components/stats-qrl/stats-qrl.component';
import { StatsComponent } from '@app/components/stats/stats.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { WaitingAnswerTransitionComponent } from '@app/components/waiting-answer-transition/waiting-answer-transition.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
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
import { CONFIG } from '@app/pages/page.constant';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { WaitingForGameStartComponent } from '@app/pages/waiting-for-game-start/waiting-for-game-start.component';
import { WaitingForPlayersPageComponent } from '@app/pages/waiting-for-players-page/waiting-for-players-page.component';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSocketService } from '@app/services/game-socket.service';
import { GameService } from '@app/services/game.service';
import { GameValidationService } from '@app/services/game.validation.service';
import { HistoryCommunicationService } from '@app/services/history.communication.service';
import { InGameService } from '@app/services/in-game.service';
import { SocketService } from '@app/services/socket.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import Ajv from 'ajv';
import { CountdownModule } from 'ngx-countdown';
import { SocketIoModule } from 'ngx-socket-io';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */

@NgModule({
    declarations: [
        AppComponent,
        StatsComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        HistogramSwitcherComponent,
        QuestionInGameComponent,
        PlayerPageComponent,
        NavbarComponent,
        ChatComponent,
        AdminPasswordComponent,
        AdminGamePageComponent,
        AdminEditgamePageComponent,
        AdminHistoryPageComponent,
        HistogramQCMComponent,
        HistogramQRLResultsComponent,
        OrgGamePageComponent,
        CreateGamePageComponent,
        PlayerListComponent,
        ResultPageComponent,
        TestPageComponent,
        ScorerComponent,
        TimerComponent,
        ChatBarComponent,
        EditQuestionQCMComponent,
        EditQuestionQRLComponent,
        ChoiceComponent,
        GameComponent,
        WaitingForPlayersPageComponent,
        JoinGamePageComponent,
        FromWaitingToPlayPageComponent,
        WaitingForGameStartComponent,
        FromWaitingToOrgPageComponent,
        OrgQrlComponent,
        HistoryComponent,
        WaitingAnswerTransitionComponent,
        HistogramQRLComponent,
        StatsQRLComponent,
        OrgQrlContainerComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        FontAwesomeModule,
        CountdownModule,
        RouterModule,
        SocketIoModule.forRoot(CONFIG),
    ],

    providers: [
        Ajv,
        GameService,
        CommunicationService,
        MatSnackBar,
        ChatService,
        GameSocketService,
        SocketService,
        WaitingForPlayersPageComponent,
        InGameService,
        HistoryCommunicationService,
        GameValidationService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
