import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.scss';

const Login: React.FC = () => {
  const { login, user, isLoading } = useAuth();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      history.replace('/app/dashboard');
    }
  }, [history, isLoading, user]);

  const handleLogin = () => {
    setError('');
    const result = login(username, password);
    if (result.ok) {
      history.replace('/app/dashboard');
      return;
    }
    setError(result.message);
  };

  return (
    <IonPage>
      <IonContent fullscreen className={`eco-content ${styles.content}`}>
        <div className={styles.shell}>
          <div className={styles.hero}>
            <IonText className={styles.kicker}>EcoScore Field Reports</IonText>
            <h1 className={styles.title}>Welcome back, observer 🌿.</h1>
            <IonText>
              Sign in to capture ecological evidence and collaborate in real time.
            </IonText>
          </div>
          <IonCard className={styles.card}>
            <IonCardContent>
              <div className={styles.form}>
                <IonItem lines="none">
                  <IonLabel position="stacked">Username</IonLabel>
                  <IonInput
                    type="text"
                    value={username}
                    placeholder="james123"
                    onIonChange={(event) => {
                      setUsername(event.detail.value ?? '');
                      setError('');
                    }}
                  />
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    placeholder="Your password"
                    onIonChange={(event) => {
                      setPassword(event.detail.value ?? '');
                      setError('');
                    }}
                  />
                </IonItem>
              </div>
              <div className={styles.actions}>
                {error ? (
                  <IonText color="danger" className={styles.error}>
                    {error}
                  </IonText>
                ) : null}
                <IonButton expand="block" onClick={handleLogin}>
                  Sign in 🔐
                </IonButton>
                <IonButton expand="block" fill="clear" routerLink="/register">
                  Create an account ✨
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
