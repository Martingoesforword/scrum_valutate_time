import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../services/player.service';

@Component({
  selector: 'app-vote-selection',
  templateUrl: './vote-selection.component.html',
  styleUrls: ['./vote-selection.component.css']
})
export class VoteSelectionComponent implements OnInit {


  options = [
    {value: 1, picUrl: 'assets/img/埃隆·马斯克.jpg' },
    {value: 2, picUrl: 'assets/img/比尔盖茨.jpg' },
    {value: 3, picUrl: 'assets/img/扎克伯格.jpg' },
    {value: 4, picUrl: 'assets/img/拉里佩奇-google.jpg' },
    {value: 8, picUrl: 'assets/img/马化腾.jpg' },
    {value: 12, picUrl: 'assets/img/张一鸣.jpg' },
    {value: 16, picUrl: 'assets/img/王兴.jpg' },
    {value: 24, picUrl: 'assets/img/雷军.jpg' },

  ];

  constructor(public playerService: PlayerService) {

  }

  ngOnInit(): void {
  }

}
