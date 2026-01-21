import { useEffect, useState } from 'react';
import './App.css';


const SCREENS = {
  HOME: 'home',
  LOGIN: 'login',
  ACCOUNT: 'account',
  PAYMENT: 'payment',
  LOGOUT: 'logout'
};

const CONTEXTS = {
  LOGIN: 'login_screen',
  PAYMENT: 'payment_screen'
};

const ACTIONS = {
  INIT: 'init',
  GET_SCORE: 'getScore'
};

const ACTIVITY_TYPES = {
  LOGIN: 'LOGIN',
  PAYMENT: 'PAYMENT'
};

function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [uiMessage, setUiMessage] = useState(''); 
  const [csid, setCsid] = useState(null);
  const [hasInit, setHasInit] = useState(false);
  const [apiStatus, setApiStatus] = useState('Idle');

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

const validateApiResponse = (action, data) => {
  const isValid =
    data &&
    data.status === 'success' &&
    typeof data.id === 'string' &&
    typeof data.request_id === 'string';

  if (isValid) {
    console.log('Response validation passed:', data);
    setApiStatus(`${action} validated (success)`);
  } else {
    console.warn('Response validation failed:', data);
    setApiStatus(`${action} response invalid`);
  }
};



const sendApiEvent = async (action, activityType) => {
  // UI status (shown on the page)
  setApiStatus(`Sending ${action}...`);

    try {
      const res = await fetch('https://hooks.zapier.com/hooks/catch/19247019/uwr0vff/', {
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
      });

      console.log('API HTTP status:', res.status);
      setApiStatus(`Sent ${action}. HTTP ${res.status}`);

      // Try to parse JSON (might fail)
      try {
        const data = await res.json();
        validateApiResponse(action, data);

      // validateApiResponse will log to console (and later we can also update UI from there if you want)
      } catch (jsonErr) {
        console.warn('Could not parse JSON response:', jsonErr);
        setApiStatus(`⚠️ ${action} sent, but no JSON to validate`);
      }

    } catch (err) {
      // CORS / Network / blocked request
      console.warn('API request failed (likely CORS). Continuing flow anyway:', err);
      setApiStatus(`⚠️ ${action} blocked (likely CORS) - continuing`);
    }
  };


  const handleUserAction = async ({ action, activityType, context, nextScreen }) => {
    console.log('User action:', action);

    if (context) {
      changeContext(context);
    }

    if (action && activityType) {
      await sendApiEvent(action, activityType);
    }

    // Always move forward
    if (nextScreen) {
      setScreen(nextScreen);
    }
  };



  return (
    <div style={{
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}}>
  <div style={{
    width: 520,
    padding: 20,
    border: '1px solid #ddd',
    borderRadius: 10
  }}>

      <h1>BioCatch Assignment - Shahar Shlomo</h1>

      <p><b>API Status:</b> {apiStatus}</p>
      <p><b>Logged In:</b> {hasInit ? 'Yes' : 'No'}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
      <button onClick={() => { setUiMessage(''); setScreen(SCREENS.HOME); }}>
        Home
      </button>

      <button onClick={() => { setUiMessage(''); setScreen(SCREENS.LOGIN); changeContext(CONTEXTS.LOGIN); }}>
        Login
      </button>

      <button onClick={() => { setUiMessage(''); setScreen(SCREENS.ACCOUNT); }}>
        Account
      </button>

      <button onClick={() => { setUiMessage(''); setScreen(SCREENS.PAYMENT); changeContext(CONTEXTS.PAYMENT); }}>
        Payment
      </button>

      <button onClick={() => {
        setUiMessage('');
        setApiStatus('Idle');
        setHasInit(false);
        setScreen(SCREENS.LOGOUT);
      }}>
        Logout
      </button>
      </div>
      {uiMessage && (
      <p style={{
        textAlign: 'center',
        marginTop: 10,
        color: uiMessage.startsWith('Error:') ? 'crimson' : 'green'
      }}>
        <b>{uiMessage}</b>
      </p>
      )}




      {/* Home Screen */}
      {screen === SCREENS.HOME && (
        <>
          <p>Home Screen</p>
          <p>Welcome! Use the navigation buttons above.</p>

        </>
      )}

      {/* Login Screen */}
      {screen === SCREENS.LOGIN && (
        <>
        <p>Login Screen</p>
        <button onClick={async () => {
          setUiMessage('');
          await handleUserAction({
            action: ACTIONS.INIT,
            activityType: ACTIVITY_TYPES.LOGIN
          });
          setHasInit(true);
          setUiMessage('Logged in (init called). You can now pay.');
        }}>
          Run Login (init)
        </button>


        </>
      )}

      {/* Account Overview Screen */}
      {screen === SCREENS.ACCOUNT && (
        <>
      <p>Account Overview (dummy)</p>

        </>
      )}

      {/* Payment Screen */}
      {screen === SCREENS.PAYMENT && (
        <>
          <p>Payment Screen</p>

          {!hasInit && (
            <p style={{ color: 'crimson', textAlign: 'center' }}>
              <b>Error:</b> You must login before making a payment.
            </p>
          )}

          <button onClick={async () => {
            if (!hasInit) {
              const msg = 'Error: Please login first (init must be called before getScore).';
              console.warn(msg);
              setUiMessage(msg);
              return;
            }

            setUiMessage('');
            await handleUserAction({
              action: ACTIONS.GET_SCORE,
              activityType: ACTIVITY_TYPES.PAYMENT
            });
            setUiMessage('Payment submitted (getScore called).');
          }}>
            Pay (getScore)
          </button>
        </>
      )}


      {/* Logout Screen */}
      {screen === SCREENS.LOGOUT && (
        <>
          <p>Logged Out</p>
          <button onClick={() => {
            setUiMessage('');
            setApiStatus('Idle');
            setHasInit(false);
            setScreen(SCREENS.HOME);
          }}>
            Back to Home
        </button>


        </>
      )}

    </div>
</div>
  );
}

export default App;
