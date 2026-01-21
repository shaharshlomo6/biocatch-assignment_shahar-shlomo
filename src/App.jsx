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


  const handleUserAction = ({ 
  action, 
  activityType, 
  context, 
  nextScreen 
  }) => {
    console.log('User action:', action);

    if (context) {
      changeContext(context);
    }

    if (action && activityType) {
      sendApiEvent(action, activityType);
    }

    if (nextScreen) {
      setScreen(nextScreen);
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <h1>BioCatch SPA Demo</h1>

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
          <button onClick={() => {
            handleUserAction({
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

            if (!hasInit) return;

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
