```jsx
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zhivpkjrgobfwzvcclnb.supabase.co',
  'PUT_YOUR_PUBLISHABLE_KEY_HERE'
);

const teams = [
  'กฟน.1','กฟน.2','กฟน.3',
  'กฟฉ.1','กฟฉ.2','กฟฉ.3',
  'กฟก.1','กฟก.2','กฟก.3',
  'กฟต.1','กฟต.2','กฟต.3'
];

const judges = [
  {name:'นางนงลักษณ์ สุวรรณจำรัส',role:'ประธาน'},
  {name:'นายภักพงษ์ วงษ์พันธุ์ทา',role:'กรรมการ'},
  {name:'นายชิดชัย เพชรแก้วสุข',role:'กรรมการ'},
  {name:'นายวีระศักดิ์ กนกหงส์',role:'กรรมการ'},
  {name:'นายสุรเดช สุวรรณ',role:'กรรมการ'},
  {name:'นายยุทธนา ยิ้มประเสริฐ',role:'กรรมการ'},
  {name:'นายวชิรพล คำเพิ่ม',role:'กรรมการ'},
  {name:'นายดอน ฉาฉ่ำ',role:'กรรมการ'},
  {name:'นายกฤษฎา เทพศาสตรา',role:'กรรมการ'},
  {name:'นายภาสกร วิชชาบูรณ์ดำรง',role:'กรรมการ'},
  {name:'นางสาวปรายปวีย์ จันทร์วาสน์',role:'กรรมการ'},
  {name:'ว่าที่ร้อยตรี สันติ ไชยสีทา',role:'กรรมการ'},
  {name:'นายอานนท์ รอตรักษา',role:'กรรมการและเลขาฯ'},
  {name:'โสภณ อินทโชติ',role:'ผู้ช่วยกรรมการ'},
  {name:'อิสริยะ เย็นทรวง',role:'ผู้ช่วยกรรมการ'}
];

const normalCategories = [
  {
    key:'onsite',
    label:'คะแนนตรวจประเมิน ณ กฟฟ. หน้างาน'
  },
  {
    key:'presentation',
    label:'คะแนนการนำเสนอผลงาน'
  }
];

const assistantCategories = [
  {
    key:'theory',
    label:'คะแนนภาคทฤษฎี'
  },
  {
    key:'fieldwork',
    label:'คะแนนแข่งภาคสนาม'
  }
];

const adminPassword = 'PEAWSC2026';

export default function App(){

  const [rows,setRows] = useState([]);
  const [preview,setPreview] = useState(false);

  const [adminPass,setAdminPass] = useState('');
  const [adminLogged,setAdminLogged] = useState(false);

  const [user,setUser] = useState(judges[0].name);

  const current = judges.find(
    j=>j.name===user
  );

  const isAssistant =
    current.role === 'ผู้ช่วยกรรมการ';

  const categories = isAssistant
    ? assistantCategories
    : normalCategories;

  const [f,setF] = useState({
    team:teams[0],
    category:categories[0].key,
    score:'',
    signed:false
  });

  useEffect(()=>{
    loadScores();
  },[]);

  async function loadScores(){

    const { data,error } = await supabase
      .from('scores')
      .select('*')
      .order('id',{ascending:false});

    if(!error && data){
      setRows(data);
    }

  }

  useEffect(()=>{

    setF(prev=>({
      ...prev,
      category:categories[0].key
    }));

  },[user]);

  const exists = rows.some(
    r =>
      r.team===f.team &&
      r.judge===user &&
      r.category===f.category
  );

  async function add(){

    if(!f.signed || exists){
      return;
    }

    const payload = {
      team:f.team,
      judge:user,
      role:current.role,
      category:f.category,
      score:Number(f.score||0),
      created_at:new Date().toISOString()
    };

    const { error } = await supabase
      .from('scores')
      .insert([payload]);

    if(error){

      alert(
        'เกิดข้อผิดพลาด: ' +
        error.message
      );

      return;
    }

    setPreview(false);

    setF({
      team:teams[0],
      category:categories[0].key,
      score:'',
      signed:false
    });

    loadScores();

  }

  const myRows = rows.filter(
    r=>r.judge===user
  );

  const ranking = useMemo(()=>{

    return teams.map(team=>{

      const rs = rows.filter(
        r=>r.team===team
      );

      const total = rs.reduce(
        (a,b)=>a+Number(b.score||0),
        0
      );

      const avg = rs.length
        ? total / rs.length
        : 0;

      return {
        team,
        total:+total.toFixed(2),
        avg:+avg.toFixed(2),
        count:rs.length
      };

    }).sort((a,b)=>b.avg-a.avg);

  },[rows]);

  return (

    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#dbeafe,#eff6ff,#ffffff)',
      padding:'24px',
      fontFamily:'sans-serif'
    }}>

      <div style={{
        maxWidth:'1400px',
        margin:'0 auto'
      }}>

        <div style={{
          background:'linear-gradient(90deg,#1d4ed8,#06b6d4)',
          color:'#fff',
          padding:'35px',
          borderRadius:'28px',
          marginBottom:'24px',
          boxShadow:'0 10px 30px rgba(0,0,0,0.15)'
        }}>

          <div style={{
            fontSize:'42px',
            fontWeight:'bold'
          }}>
            🏆 PEA SCORE SYSTEM
          </div>

          <div style={{
            marginTop:'10px',
            fontSize:'22px'
          }}>
            ระบบลงคะแนนการแข่งขันออนไลน์
          </div>

        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'1fr 1fr',
          gap:'24px'
        }}>

          <div style={cardStyle}>

            <div style={titleStyle}>
              👨‍⚖️ แบบฟอร์มลงคะแนน
            </div>

            <div style={labelStyle}>
              เลือกกรรมการ
            </div>

            <select
              value={user}
              onChange={e=>setUser(e.target.value)}
              style={inputStyle}
            >

              {judges.map(j=>(

                <option
                  key={j.name}
                >
                  {j.name}
                </option>

              ))}

            </select>

            <div style={{
              marginTop:'12px',
              background:'#eff6ff',
              padding:'12px',
              borderRadius:'14px'
            }}>
              ตำแหน่ง: {current.role}
            </div>

            <div style={labelStyle}>
              ทีมแข่งขัน
            </div>

            <select
              value={f.team}
              onChange={e=>setF({
                ...f,
                team:e.target.value
              })}
              style={inputStyle}
            >

              {teams.map(t=>(

                <option key={t}>
                  {t}
                </option>

              ))}

            </select>

            <div style={labelStyle}>
              ประเภทคะแนน
            </div>

            <select
              value={f.category}
              onChange={e=>setF({
                ...f,
                category:e.target.value
              })}
              style={inputStyle}
            >

              {categories.map(c=>(

                <option
                  key={c.key}
                  value={c.key}
                >
                  {c.label}
                </option>

              ))}

            </select>

            <div style={labelStyle}>
              คะแนน (0 - 5)
            </div>

            <input
              type='number'
              min='0'
              max='5'
              step='0.1'
              value={f.score}
              onChange={e=>setF({
                ...f,
                score:e.target.value
              })}
              style={inputStyle}
            />

            <label style={{
              display:'flex',
              gap:'10px',
              marginTop:'20px'
            }}>

              <input
                type='checkbox'
                checked={f.signed}
                onChange={e=>setF({
                  ...f,
                  signed:e.target.checked
                })}
              />

              ยืนยันการตรวจสอบคะแนน

            </label>

            {exists && (

              <div style={{
                color:'red',
                marginTop:'12px'
              }}>
                ลงคะแนนรายการนี้แล้ว
              </div>

            )}

            <button
              disabled={!f.signed || exists}
              onClick={()=>setPreview(true)}
              style={{
                ...buttonStyle,
                opacity:
                  (!f.signed || exists)
                  ? 0.5
                  : 1
              }}
            >
              ✅ ตรวจสอบก่อนส่งคะแนน
            </button>

          </div>

          <div style={cardStyle}>

            <div style={titleStyle}>
              📋 คะแนนที่ฉันลงไว้
            </div>

            <table style={{
              width:'100%',
              borderCollapse:'collapse'
            }}>

              <thead>

                <tr style={{
                  background:'#eff6ff'
                }}>

                  <th style={thStyle}>
                    ทีม
                  </th>

                  <th style={thStyle}>
                    ประเภท
                  </th>

                  <th style={thStyle}>
                    คะแนน
                  </th>

                </tr>

              </thead>

              <tbody>

                {myRows.map((r,i)=>(

                  <tr key={i}>

                    <td style={tdStyle}>
                      {r.team}
                    </td>

                    <td style={tdStyle}>
                      {r.category}
                    </td>

                    <td style={tdStyle}>
                      <b>{r.score}</b>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        <div style={{
          ...cardStyle,
          marginTop:'24px'
        }}>

          <div style={titleStyle}>
            🔒 เข้าสู่ระบบผู้มีสิทธิ์
          </div>

          {!adminLogged ? (

            <>

              <input
                type='password'
                placeholder='รหัสผ่าน'
                value={adminPass}
                onChange={e=>setAdminPass(
                  e.target.value
                )}
                style={inputStyle}
              />

              <button
                onClick={()=>{

                  if(
                    adminPass===adminPassword
                  ){
                    setAdminLogged(true);
                  }else{
                    alert('รหัสผ่านไม่ถูกต้อง');
                  }

                }}
                style={buttonStyle}
              >
                Login
              </button>

            </>

          ) : (

            <>

              <div style={{
                marginBottom:'20px',
                color:'green',
                fontWeight:'bold'
              }}>
                ✅ เข้าสู่ระบบสำเร็จ
              </div>

              <table style={{
                width:'100%',
                borderCollapse:'collapse'
              }}>

                <thead>

                  <tr style={{
                    background:'#eff6ff'
                  }}>

                    <th style={thStyle}>
                      อันดับ
                    </th>

                    <th style={thStyle}>
                      ทีม
                    </th>

                    <th style={thStyle}>
                      คะแนนรวม
                    </th>

                    <th style={thStyle}>
                      คะแนนเฉลี่ย
                    </th>

                    <th style={thStyle}>
                      จำนวนคะแนน
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {ranking.map((r,i)=>(

                    <tr key={i}>

                      <td style={tdStyle}>
                        {i+1}
                      </td>

                      <td style={tdStyle}>
                        <b>{r.team}</b>
                      </td>

                      <td style={tdStyle}>
                        {r.total}
                      </td>

                      <td style={tdStyle}>
                        {r.avg}
                      </td>

                      <td style={tdStyle}>
                        {r.count}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </>

          )}

        </div>

      </div>

      {preview && (

        <div style={{
          position:'fixed',
          inset:0,
          background:'rgba(0,0,0,0.5)',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          zIndex:999
        }}>

          <div style={{
            background:'#fff',
            width:'420px',
            maxWidth:'95%',
            borderRadius:'24px',
            padding:'28px'
          }}>

            <div style={{
              fontSize:'28px',
              fontWeight:'bold',
              marginBottom:'18px'
            }}>
              🔍 ตรวจสอบก่อนส่ง
            </div>

            <div style={{
              lineHeight:'2'
            }}>

              <div>
                <b>ทีม:</b> {f.team}
              </div>

              <div>
                <b>ประเภท:</b> {f.category}
              </div>

              <div>
                <b>คะแนน:</b> {f.score}
              </div>

            </div>

            <div style={{
              display:'flex',
              gap:'12px',
              marginTop:'24px'
            }}>

              <button
                onClick={()=>setPreview(false)}
                style={{
                  flex:1,
                  padding:'14px',
                  border:'none',
                  borderRadius:'14px'
                }}
              >
                ย้อนกลับ
              </button>

              <button
                onClick={add}
                style={{
                  flex:1,
                  padding:'14px',
                  border:'none',
                  borderRadius:'14px',
                  background:'#2563eb',
                  color:'#fff',
                  fontWeight:'bold'
                }}
              >
                ยืนยันส่งคะแนน
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

const cardStyle = {
  background:'#fff',
  borderRadius:'24px',
  padding:'24px',
  boxShadow:'0 10px 25px rgba(0,0,0,0.08)'
};

const titleStyle = {
  marginBottom:'20px',
  fontSize:'24px',
  fontWeight:'bold'
};

const labelStyle = {
  marginTop:'16px',
  marginBottom:'8px',
  fontWeight:'bold'
};

const inputStyle = {
  width:'100%',
  padding:'14px',
  borderRadius:'14px',
  border:'1px solid #cbd5e1',
  fontSize:'16px',
  boxSizing:'border-box'
};

const buttonStyle = {
  width:'100%',
  marginTop:'24px',
  padding:'16px',
  border:'none',
  borderRadius:'18px',
  background:'linear-gradient(90deg,#2563eb,#06b6d4)',
  color:'#fff',
  fontWeight:'bold',
  fontSize:'18px',
  cursor:'pointer'
};

const thStyle = {
  padding:'14px',
  borderBottom:'1px solid #e2e8f0',
  textAlign:'center'
};

const tdStyle = {
  padding:'14px',
  borderBottom:'1px solid #f1f5f9',
  textAlign:'center'
};
```
