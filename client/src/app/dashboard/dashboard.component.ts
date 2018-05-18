import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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
	status = {
		addReg: "",
		command: "",
		edit: ""
	}
	permOptions = ["Viewer", "Regular", "Subscriber", "Moderator", "Broadcaster"];
	tab = "perms";

	isSelected(tab: string){
		return tab==this.tab;
	}
	changeTab(tab: string){
		this.tab = tab;
	}
	updateConfig(prop, val){
		console.log(prop, val)
	}

	constructor() { }

	ngOnInit() {
	}

}
