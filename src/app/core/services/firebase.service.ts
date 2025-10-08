import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebase);
  private _auth: Auth;
  private _firestore: Firestore;
  private _storage: FirebaseStorage;

  constructor() {
    this._auth = getAuth(this.app);
    this._firestore = getFirestore(this.app);
    this._storage = getStorage(this.app);
  }

  get auth(): Auth {
    return this._auth;
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get storage(): FirebaseStorage {
    return this._storage;
  }
}