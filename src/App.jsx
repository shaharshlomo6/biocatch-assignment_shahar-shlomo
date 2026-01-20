import { useEffect, useState } from 'react';

function App() {
  const [screen, setScreen] = useState('home');
  const [csid, setCsid] = useState(null);

  // init CSID once
  useEffect(() => {
    const newCsid = 'csid-' + crypto.randomUUID();
    setCsid(newCsid);

    if (window.cdApi) {
      cdApi.setCustomerSessionId(newCsid);
      console.log('CSID set:', newCsid);
    }
  }, []);

  const changeContext = (context) => {
    if (window.cdApi) {
      cdApi.changeContext(context);
      console.log('Context:', context);
    }
  };

  const sendApiEvent = (action, activityType) => {
    fetch('https://hooks.zapier.com/hooks/catch/19247019/uwr0vff/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'dummy',
        action,
        customerSessionId: csid,
        activityType,
        uuid: crypto.randomUUID(),
        brand: 'SD',
        solution: 'ATO',
        iam: 'shaharshlomo6@gmail.com'
      })
    })
      .then(() => console.log(action, 'sent'))
      .catch(err => console.error('API error:', err));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>BioCatch SPA Demo</h1>

      {screen === 'home' && (
        <>
          <p>Home Screen</p>
          <button onClick={() => {
            setScreen('login');
            changeContext('login_screen');
          }}>
            Go to Login
          </button>
        </>
      )}

      {screen === 'login' && (
        <>
          <p>Login Screen</p>
          <button onClick={() => {
            sendApiEvent('init', 'LOGIN');
            setScreen('account');
          }}>
            Login
          </button>
        </>
      )}

      {screen === 'account' && (
        <>
          <p>Account Overview</p>
          <button onClick={() => {
            setScreen('payment');
            changeContext('payment_screen');
          }}>
            Make Payment
          </button>
        </>
      )}

      {screen === 'payment' && (
        <>
          <p>Payment Screen</p>
          <button onClick={() => {
            sendApiEvent('getScore', 'PAYMENT');
            setScreen('logout');
          }}>
            Pay
          </button>
        </>
      )}

      {screen === 'logout' && (
        <>
          <p>Logged Out</p>
          <button onClick={() => {
            setScreen('home');
          }}>
            Back to Home
          </button>
        </>
      )}
    </div>
  );
}

export default App;
