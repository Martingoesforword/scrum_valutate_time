import {Injectable} from '@angular/core';
import {Socket} from '@hochdreih/ngx-socket-io-3';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  manager: string;
  roomId: Number;
  username: string;
  allPlayers: Array<any>;
  cardValueIsShown: boolean;
  results: any;
  results2: any;
  num: any;
  possibleValues: Array<number>;
  currentSelfValue: number;

  constructor(private socket: Socket, private message: NzMessageService) {
    this.results = [];
    this.results2 = 0;
    this.num = 0;
    this.possibleValues = [1, 2, 3, 4, 8, 12, 16, 24];
    this.currentSelfValue = 0;

    this.socket.on('allVotes', (info) => {
      this.allPlayers = info['allVotes'];
      this.roomId = info['roomId'];
      this.manager = info['manager'] || this.manager;
    });

    this.socket.on('showCards', () => {
      this.resetResults();
      this.evaluateResults();
      this.cardValueIsShown = true;
    });

    this.socket.on('hideCards', () => {
      this.cardValueIsShown = false;
    });

    this.cardValueIsShown = false;
  }

  showSetRoomId(): void {
    //打开roomid填写框
  }

  sendVote(value: number): void {
    if (!this.cardValueIsShown) {
      this.socket.emit('vote', {
        name: this.username,
        voteValue: value,
        roomId: this.roomId
      });
      this.currentSelfValue = value;

      if (value !== 0) {
        this.message.success('提交估时成功！');
      }

    } else {
      this.message.error('Could not send vote since the current round is completed!');
    }
  }

  showCards(): void {
    this.socket.emit('showCards',{
      name: this.username,
      roomId: this.roomId
    });
  }

  resetGame(): void {
    this.socket.emit('reset',{
      name: this.username,
      roomId: this.roomId
    });
    this.currentSelfValue = 0;
  }

  resetVotes(): void {
    this.socket.emit('resetVotes',{
      name: this.username,
      roomId: this.roomId
    });
    this.currentSelfValue = 0;
  }

  resetResults(): void {
    this.results = [];
    this.possibleValues.forEach((value) => {
      const entry = {
        name: value,
        value: 0,
      };
      this.results.push(entry);
    });
  }

  evaluateResults(): void {
    this.results2 = 0;
    this.num = 0;
    this.allPlayers.forEach((player) => {
      this.results.forEach((entry) => {
        if (player.voteValue === entry.name) {
          entry.value++;
        }
      });
      if (player.voteValue) {
        this.num++;
        this.results2 += player.voteValue;
      }
    });
    this.results2 = this.results2 / (this.num) || 0;

  }
}
