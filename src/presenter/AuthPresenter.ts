import AuthModel, { AuthState } from '../model/AuthModel';

export interface AuthView {
  updateAuthState(state: AuthState): void;
}

class AuthPresenter {
  private view: AuthView | null = null;
  
  constructor() {
    this.initialize();
  }
  
  async initialize(): Promise<void> {
    await AuthModel.init();
    this.updateView();
  }
  
  attachView(view: AuthView): void {
    this.view = view;
    this.updateView();
  }
  
  detachView(): void {
    this.view = null;
  }
  
  private updateView(): void {
    if (this.view) {
      this.view.updateAuthState(AuthModel.getState());
    }
  }
  
  async signIn(): Promise<void> {
    const newState = await AuthModel.signIn();
    if (this.view) {
      this.view.updateAuthState(newState);
    }
  }
  
  async signOut(): Promise<void> {
    const newState = await AuthModel.signOut();
    if (this.view) {
      this.view.updateAuthState(newState);
    }
  }
  
  getAuthState(): AuthState {
    return AuthModel.getState();
  }
}

export default new AuthPresenter(); 