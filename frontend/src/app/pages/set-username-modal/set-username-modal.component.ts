import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../services/player.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-set-username-modal',
  templateUrl: './set-username-modal.component.html',
  styleUrls: ['./set-username-modal.component.css']
})
export class SetUsernameModalComponent implements OnInit {
  isVisible: any;
  usernameForm: FormGroup;
  hasOldUser: any;
  okText: any;
  usernameFormOld: any;
  cancelText: any;

  constructor(public playerService: PlayerService, private fb: FormBuilder) {
    this.isVisible = true;
    this.usernameForm = this.fb.group({
      username: [null, Validators.required],
      roomId: [null, Validators.required]
    });

    this.cancelText = '使用上次用户';
    this.usernameFormOld = {
      username: localStorage.getItem('oldUserName'),
      roomId: localStorage.getItem('oldUserRoomId')
    };
    this.hasOldUser = !!localStorage.getItem('oldUserName');

    this.okText = '确定' + (this.hasOldUser ? '（点击关闭使用上一个用户）' : '');
  }

  ngOnInit(): void {
  }


  handleOk(value: any): void {
    if (value.username && value.roomId){
      localStorage.setItem('oldUserName', value.username);
      localStorage.setItem('oldUserRoomId', value.roomId);
      this.playerService.username = value.username;
      this.playerService.roomId = value.roomId;
      this.isVisible = false;
      this.playerService.sendVote(0);
    }

  }
}
