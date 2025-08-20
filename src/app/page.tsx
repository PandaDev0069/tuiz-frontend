import styles from './page.module.css';
import { Button, Card, CardHeader, CardBody, Input } from '@/ui';

export default function Page() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>TUIZ</h1>
        <p className={styles.subtitle}>Welcome to TUIZ - Your interactive quiz platform</p>

        <div className={styles.showcase}>
          <Card variant="default">
            <CardHeader>
              <h2>Get Started</h2>
            </CardHeader>
            <CardBody>
              <p>Ready to create amazing quizzes? Let&apos;s get started!</p>
              <div className={styles.buttonGroup}>
                <Button variant="primary" size="md">
                  Create Quiz
                </Button>
                <Button variant="ghost" size="md">
                  Browse Quizzes
                </Button>
                <Button variant="soft" size="md">
                  Learn More
                </Button>
              </div>
              <div className={styles.inputGroup}>
                <Input placeholder="Search for quizzes..." />
              </div>
            </CardBody>
          </Card>

          <div className={styles.cardGrid}>
            <Card variant="accent">
              <CardBody>
                <h3>Featured Quiz</h3>
                <p>Try our most popular quiz!</p>
              </CardBody>
            </Card>

            <Card variant="success">
              <CardBody>
                <h3>Achievements</h3>
                <p>Track your progress</p>
              </CardBody>
            </Card>

            <Card variant="glass">
              <CardBody>
                <h3>Statistics</h3>
                <p>View your quiz stats</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
