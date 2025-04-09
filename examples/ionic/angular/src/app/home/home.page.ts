import { Component, OnInit } from '@angular/core';
// Import the SDK type definitions
import '../../assets/sdk/thndr-sdk.d.ts';

// Extend the Window interface to include our SDK functions and variables
declare global {
  interface Window {
    initGame: any;
    demoBalance: number;
    cancelInvoice: (invoice: any, origin: string) => void;
    enableLogging: () => void;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  constructor() {
    console.log('HomePage constructor');
  }

  ngOnInit() {
    console.log('HomePage ngOnInit');
    this.initThndrSdk();
  }

  // Define callback functions as class methods to maintain proper scope
  getToken = () => {
    console.log('getToken called');
    return "demo"; // Replace with your token
  }
  
  getBalance = () => {
    console.log('getBalance called');
    return {
      balance: window.demoBalance, // Replace with your balance
      currency: "cents",
    };
  }
  
  closeIframe = () => {
    console.log('closeIframe called');
  }

  handleError = (error: { code: string }) => {
    console.log('handleError called with error:', error);
    return false;
  }

  initThndrSdk() {
    console.log('Initializing THNDR SDK...');
    try {
      // Initialize the game with class methods as callbacks
      window.initGame(
        "games_iframe",
        "http://localhost:8101",
        this.getToken,
        this.getBalance,
        this.closeIframe,
        this.handleError,
      );
      console.log('THNDR SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing THNDR SDK:', error);
    }
  }
}
