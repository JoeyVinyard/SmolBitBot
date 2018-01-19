import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TwitchService } from '../services/twitch.service';

@Component({
  selector: 'app-connected',
  templateUrl: './connected.component.html',
  styleUrls: ['./connected.component.css']
})
export class ConnectedComponent implements OnInit {

constructor(private activeRoute: ActivatedRoute, private twitch: TwitchService) {
	this.activeRoute.queryParamMap.subscribe((queryParamMap) => {
		this.twitch.getOAuth(queryParamMap.get("code"));
	})
}

  ngOnInit() {
  }

}
