import { Component, OnInit } from '@angular/core';
import { TwitchService } from '../services/twitch.service'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

	connect(){
		this.twitch.connect();
	}

	constructor(private twitch: TwitchService) { }

	ngOnInit() {
	}
}
