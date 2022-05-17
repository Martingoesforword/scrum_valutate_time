import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../services/player.service';

@Component({
  selector: 'app-vote-selection',
  templateUrl: './vote-selection.component.html',
  styleUrls: ['./vote-selection.component.css']
})
export class VoteSelectionComponent implements OnInit {


  options = [
    {value: 0.5, picUrl: 'assets/img/0.5.png' },
    {value: 1, picUrl: 'assets/img/1.png' },
    {value: 2, picUrl: 'assets/img/2.png' },
    {value: 3, picUrl: 'assets/img/3.png' },
    {value: 4, picUrl: 'assets/img/4.png' },
    {value: 6, picUrl: 'assets/img/6.png' },
    {value: 9, picUrl: 'assets/img/9.png' },
    {value: 12, picUrl: 'assets/img/12.png' },
  ];

  constructor(public playerService: PlayerService) {

  }

  ngOnInit(): void {
  }

}
