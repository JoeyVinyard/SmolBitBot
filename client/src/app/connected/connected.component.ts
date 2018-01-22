import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TwitchService } from '../services/twitch.service';

@Component({
  selector: 'app-connected',
  templateUrl: './connected.component.html',
  styleUrls: ['./connected.component.css']
})
export class ConnectedComponent implements OnInit {

	connected = false;
	successCounter = 5;

	countDown(cc: ConnectedComponent){
		cc.successCounter--;
		if(cc.successCounter > 0){
			setTimeout(cc.countDown, 1000, cc);
		}else{
			cc.router.navigateByUrl("dashboard");
		}
	}

	constructor(private activeRoute: ActivatedRoute, private router: Router, private twitch: TwitchService) {
		this.activeRoute.queryParamMap.subscribe((queryParamMap) => {
			this.twitch.getOAuth(queryParamMap.get("code")).subscribe((data: any = {}) => {
				window.localStorage.setItem("twitchToken", data.token);
				this.connected = true;
				this.countDown(this);
			}, (err) => {
				console.error(err);
			});
		})
	}

	ngOnInit() {
	}

}
