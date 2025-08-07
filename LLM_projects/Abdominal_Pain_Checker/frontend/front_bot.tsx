import React, { useState, useEffect, useRef } from 'react';

interface E {
  s: 'user' | 'bot';
  t: string;
}

const Bot = () => {
  const [d, setD] = useState<E[]>([]);
  const [uA, setUA] = useState<string>('');
  const [aV, setAV] = useState<string>('');
  const [iU, setIU] = useState<string>('');
  const [fS, setFS] = useState<'age_verification' | 'chat'>('age_verification');
  const [eM, setEM] = useState<string>('');
  const rF = useRef<HTMLDivElement>(null);
  const [pS, setPS] = useState<boolean>(false);

  useEffect(() => {
    setIU(Date.now().toString());
  }, []);

  useEffect(() => {
    rF.current?.scrollIntoView({ behavior: 'smooth' });
  }, [d]);

  const pC = async () => {
    const age = parseInt(aV);

    setEM('');
    setPS(true);

    try {
      const response = await fetch('http://localhost:8000/verify_age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: age,
          session_id: iU,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.allowed) {
        setFS('chat');
        setD([{ s: 'bot', t: "Greetings. Describe your primary abdominal discomfort." }]);
      } else {
        setEM(data.message);
      }
    } catch (error) {
      console.error("Can't verify age right now. Error:", error);
      setEM('Age check failed. Reattempt.');
    } finally {
      setPS(false);
    }
  };

  const eC = async () => {
    if (uA.trim() === '') {
      return;
    }

    const uX: E = { s: 'user', t: uA };

    setD((prevD) => [...prevD, uX]);
    setUA('');
    setPS(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: uX.t, session_id: iU })
      });

      if (!response.ok) {
        throw new Error(`HTTPS error! status: ${response.status}`);
      }

      const data = await response.json();

      const bR: E = { s: 'bot', t: data.response };

      setD((prevD) => [...prevD, bR]);
    } catch (error) {
      console.error('Error sending message:', error);
      setD((prevD) => [
        ...prevD,
        { s: 'bot', t: 'Network issue. Try again.' }
      ]);
    } finally {
      setPS(false);
    }
  };

  const kH = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      eC();
    }
  };

  const aKH = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      pC();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans text-gray-200">
      <div className="flex flex-col w-full max-w-2xl bg-gray-900 rounded-lg shadow-lg overflow-hidden h-[85vh]">
        <div className="bg-gray-800 p-4 text-gray-100 text-center rounded-t-lg shadow-sm">
          <h1 className="text-2xl font-bold">Abdos</h1>
          <p className="text-sm opacity-90 mt-1">Diagnosis for abdominal pain.</p>
        </div>

        {fS === 'age_verification' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 bg-gray-850">
            <p className="text-lg text-gray-200 text-center font-semibold">
              Verify age before accessing the bot.
            </p>
            <p className="text-sm text-gray-400 text-center">
              Only for individuals 18+.
            </p>

            <input
              type="number"
              value={aV}
              onChange={(e) => setAV(e.target.value)}
              onKeyDown={aKH}
              placeholder="Input age"
              className="w-full max-w-xs p-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-900 text-gray-100 placeholder-gray-500 text-center"
              min="1"
              max="120"
              disabled={pS}
            />

            {eM && (
              <p className="text-red-500 text-sm text-center">{eM}</p>
            )}

            <button
              onClick={pC}
              className="px-6 py-3 bg-gray-700 text-gray-100 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pS || aV.trim() === ''}
            >
              Confirm Age
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-850">
              {d.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.s === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm break-words ${
                      msg.s === 'user'
                        ? 'bg-gray-700 text-gray-100 rounded-br-none'
                        : 'bg-gray-600 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    {msg.t.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="my-1">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {pS && (
                <div className="flex justify-start">
                  <div className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={rF} />
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center space-x-3">
              <input
                type="text"
                value={uA}
                onChange={(e) => setUA(e.target.value)}
                onKeyDown={kH}
                placeholder="Describe abdominal discomfort..."
                className="flex-1 p-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-950 text-gray-100 placeholder-gray-500"
                disabled={pS}
              />
              <button
                onClick={eC}
                className="px-6 py-3 bg-gray-700 text-gray-100 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pS || uA.trim() === ''}
              >
                Transmit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Bot;
