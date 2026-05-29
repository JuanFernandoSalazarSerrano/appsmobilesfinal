import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage
} from '@ionic/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createId } from '../helpers/ids';
import { useAuth } from '../hooks/useAuth';
import AppHeader from '../shared/AppHeader';
import styles from './ReportChat.module.scss';

interface ReportChatParams {
  reportId: string;
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

const ReportChat: React.FC = () => {
  const { reportId } = useParams<ReportChatParams>();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = () => {
    if (!draft.trim()) {
      return;
    }

    const message: ChatMessage = {
      id: createId(),
      author: user?.name ?? user?.email ?? 'Observer',
      text: draft.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, message]);
    setDraft('');
  };

  return (
    <IonPage>
      <AppHeader title={`Report chat #${reportId.slice(0, 6)} 💬`} />
      <IonContent className={`eco-content ${styles.content}`}>
        <IonList className={styles.list}>
          {messages.map((message) => (
            <IonItem key={message.id} lines="none" className={styles.item}>
              <IonLabel>
                <p className={styles.meta}>
                  {message.author} · {new Date(message.createdAt).toLocaleTimeString()}
                </p>
                <h3>{message.text}</h3>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <div className={styles.input}>
          <IonItem lines="none">
            <IonLabel position="stacked">New message ✍️</IonLabel>
            <IonInput
              value={draft}
              placeholder="Share a field note 🌿"
              onIonChange={(event) => setDraft(event.detail.value ?? '')}
            />
          </IonItem>
          <IonButton expand="block" onClick={handleSend}>
            Send message 🚀
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportChat;
