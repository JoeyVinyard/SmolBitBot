import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { config } from "../../environments/config"

@Injectable()
export class TwitchService {

	connect(){
		window.location.href = 
			"https://api.twitch.tv/kraken/oauth2/authorize"+
			"?client_id="+config.twitchClientId+
			"&redirect_uri=http://localhost:4200/connected"+
			"&response_type=code"+
			"&scope=user:read:email"
	}
	getOAuth(token: string){
		return this.http.get("http://localhost:3000/oauth",{
			params: new HttpParams().set("token", token)
		});
	}

	constructor(private http: HttpClient) {}

}