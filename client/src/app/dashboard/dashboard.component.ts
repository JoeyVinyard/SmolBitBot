import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	config = {
		addReg: "Viewer",
		command: "Viewer",
		edit: "Viewer"
	}
	permOptions = ["Viewer", "Regular", "Subscriber", "Moderator", "Broadcaster"];

	constructor() { }

	ngOnInit() {
	}

}
