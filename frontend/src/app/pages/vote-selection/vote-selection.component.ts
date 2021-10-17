import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../services/player.service';

@Component({
  selector: 'app-vote-selection',
  templateUrl: './vote-selection.component.html',
  styleUrls: ['./vote-selection.component.css']
})
export class VoteSelectionComponent implements OnInit {


  options = [
    {value: 1, picUrl: 'assets/img/1.png' },
    {value: 2, picUrl: 'assets/img/2.png' },
    {value: 3, picUrl: 'assets/img/3.png' },
    {value: 4, picUrl: 'assets/img/5.png' },
    {value: 8, picUrl: 'assets/img/8.png' },
    {value: 12, picUrl: 'assets/img/13.png' },
    {value: 16, picUrl: 'assets/img/21.png' },
    {value: 24, picUrl: 'assets/img/40.png' },
  ];

  constructor(public playerService: PlayerService) {

  }

  ngOnInit(): void {
  }

}
