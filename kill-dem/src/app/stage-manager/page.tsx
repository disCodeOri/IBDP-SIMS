"use client";

import { Manager, Space, BasicWindow } from "@/components/stage-manager";

export default function StageDemo() {
  return (
    <div style={{ padding: '2rem', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem' }}>Stage Manager Demo</h1>
      
      <Manager size={[1280, 720]} style={{ margin: '0 auto', border: '2px solid #333', borderRadius: '8px' }}>
        <Space>
          <BasicWindow
            title="Document 1"
            initialPosition={[100, 100]}
            initialSize={[400, 300]}
            style={{ background: '#fff' }}
          >
            <div style={{ padding: '1rem' }}>
              <h2>Document Content</h2>
              <p>Drag the title bar to move the window</p>
              <p>Drag edges to resize</p>
            </div>
          </BasicWindow>

          <BasicWindow
            title="Browser"
            initialPosition={[300, 200]}
            initialSize={[500, 400]}
            style={{ background: '#fff' }}
          >
            <div style={{ padding: '1rem' }}>
              <h3>Web Content</h3>
              <p>Try dragging windows close to each other to see snapping behavior</p>
            </div>
          </BasicWindow>

          <BasicWindow
            title="Settings"
            initialPosition={[700, 150]}
            initialSize={[300, 250]}
            style={{ background: '#fff' }}
          >
            <div style={{ padding: '1rem' }}>
              <p>System Settings</p>
              <ul>
                <li>Display</li>
                <li>Network</li>
                <li>Storage</li>
              </ul>
            </div>
          </BasicWindow>
        </Space>
      </Manager>
    </div>
  );
}