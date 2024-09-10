import { useCallback, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import OneDarkPro from './themes/onedarkpro.json';

const sampleCode = `interface User {
    name: string;
    age: number;
}

const user: User = {
    name: "John Doe",
    age: 65
}

if (user.age < 60) throw new Error("No old enougth")
`;

function Icon({ type }: { type: 'file' | 'directory' }) {
  return type === 'directory' ? '📁' : '📄';
}

interface FileTree {
  children?: {
    name: string;
    type: FileTreeType;
    children?: FileTree['children'];
  }[];
}

type FileTreeType = 'file' | 'directory';

const files: FileTree = {
  children: [
    {
      name: 'src',
      type: 'directory',
      children: [
        {
          name: 'utils',
          type: 'directory',
          children: [
            {
              name: 'helpers.ts',
              type: 'file',
            },
          ],
        },
        {
          name: 'main.ts',
          type: 'file',
        },
      ],
    },

    {
      name: 'package.json',
      type: 'file',
    },
  ],
};

function Entry(entry: { name: string; type: FileTreeType; children?: FileTree['children'] }) {
  return (
    <>
      <Icon type={entry.type} />
      {entry.name}

      {entry.children && (
        <ul>
          {entry.children.map((child) => {
            return (
              <li style={{ marginLeft: 20 }}>
                <Entry {...child} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function App() {
  const [code, setCode] = useState<string>(sampleCode);
  const [language, setLanguage] = useState<string>('typescript');
  const [sidebarWidth, setSidebarWidth] = useState<number>(250);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleEditorDidMount = (monaco: any) => {
    monaco.editor.defineTheme('OneDarkPro', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7f7f7f', fontStyle: 'italic' },
        // Define other rules as needed
      ],

      ...OneDarkPro,
    });
  };

  const handleMouseDown = (e: any) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(sidebarWidth);
    e.preventDefault(); // Prevent default drag behavior
  };

  const handleMouseMove = useCallback(
    (e: any) => {
      if (isResizing) {
        const newWidth = startWidth + (e.clientX - startX);
        setSidebarWidth(newWidth > 50 ? newWidth : 50); // Prevent width from becoming too small
      }
    },
    [isResizing, startX, startWidth]
  );

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <div className="flex h-full select-none">
      <aside className=" bg-[#191c21] text-white p-4 cursor-col-resize" onMouseDown={handleMouseDown} style={{ width: sidebarWidth }}>
        <h2 className="text-lg font-bold mb-4 mt-7">Mini Vscode</h2>
        <ul>
          {/* <li className="mb-2">
            <button className="w-full text-left">
              <span className="mr-2">📄</span>main.ts
            </button>
          </li>
          <li className="mb-2">
            <button className="w-full text-left">📦 package.json</button>
          </li>
          <li className="mb-2">
            <button className="w-full text-left">📄 README.md</button>
          </li> */}

          {files.children?.map((entry) => {
            return (
              <>
                <Entry {...entry} />
              </>
            );
          })}
        </ul>
      </aside>
      <main className="flex-1 p-0 m-0 w-full h-full">
        <MonacoEditor
          className="mt-8"
          width="100%"
          height="100vh"
          defaultLanguage={language}
          defaultValue={code}
          theme="OneDarkPro"
          beforeMount={handleEditorDidMount}
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            fontFamily: 'Jetbrains-Mono',
            fontLigatures: true,
            wordWrap: 'on',
            bracketPairColorization: {
              enabled: true,
            },
            cursorBlinking: 'expand',
            formatOnPaste: true,
          }}
          onChange={(value) => setCode(value as string)}
        />
      </main>
    </div>
  );
}

export default App;
