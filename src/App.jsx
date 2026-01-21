import { useEffect, useState } from 'react';


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
    setApiStatus(`✅ ${action} validated (success)`);
  } else {
    console.warn('Response validation failed:', data);
    setApiStatus(`⚠️ ${action} response invalid`);
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
    <div style={{ padding: 20 }}>
      <h1>BioCatch Assignment - Shahar Shlomo</h1>

      <p><b>API Status:</b> {apiStatus}</p>


      {/* Home Screen */}
      {screen === SCREENS.HOME && (
        <>
          <p>Home Screen</p>
          <button onClick={() => {
            setScreen(SCREENS.LOGIN);
            changeContext(CONTEXTS.LOGIN);
          }}>
            Go to Login
          </button>
        </>
      )}

      {/* Login Screen */}
      {screen === SCREENS.LOGIN && (
        <>
          <p>Login Screen</p>
          <button onClick={async () => {
            await handleUserAction({
              action: ACTIONS.INIT,
              activityType: ACTIVITY_TYPES.LOGIN,
              nextScreen: SCREENS.ACCOUNT
            });
            setHasInit(true);
          }}>
            Login
          </button>

        </>
      )}

      {/* Account Overview Screen */}
      {screen === SCREENS.ACCOUNT && (
        <>
        <p>Account Overview</p>
        <button onClick={() => {
          setScreen(SCREENS.PAYMENT);
          changeContext(CONTEXTS.PAYMENT);
        }}>
          Make Payment
        </button>
        </>
      )}

      {/* Payment Screen */}
      {screen === SCREENS.PAYMENT && (
        <>
          <p>Payment Screen</p>
          <button onClick={() => {

        if (!hasInit) {
          console.warn('Blocked getScore: init was not triggered yet');
          return;
        }
            handleUserAction({
              action: ACTIONS.GET_SCORE,
              activityType: ACTIVITY_TYPES.PAYMENT,
              nextScreen: SCREENS.LOGOUT
            });
          }}>
            Pay
          </button>
        </>
      )}

      {/* Logout Screen */}
      {screen === SCREENS.LOGOUT && (
        <>
          <p>Logged Out</p>
          <button onClick={() => {
            setScreen(SCREENS.HOME);
          }}>
            Back to Home
          </button>
        </>
      )}

    </div>
  );
}

export default App;
