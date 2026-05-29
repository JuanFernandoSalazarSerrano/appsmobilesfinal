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
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.scss';

const Register: React.FC = () => {
  const { register } = useAuth();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');
    const result = register(username, password);
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
            <h1 className={styles.title}>Start your field log 🌱.</h1>
            <IonText>
              Create an account to store reports and share observations with others.
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
                    placeholder="newuser"
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
                    placeholder="Create a password"
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
                <IonButton expand="block" onClick={handleRegister}>
                  Create account ✨
                </IonButton>
                <IonButton expand="block" fill="clear" routerLink="/login">
                  Back to sign in 🔐
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
