import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zhivpkjrgobfwzvcclnb.supabase.co',
  'sb_publishable_KsiY5dGDvyqVcBfp8usNMw_HOLU_Mfr'
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
  {name:'ทีมงาน กบร./ ศฝฟ.',role:'ผู้ช่วยกรรมการ'},
  {name:'test1',role:'test'},
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

const onsiteTopics = [
  {
    key:'maintenance',
    label:'Maintenance and Improvement'
  },
  {
    key:'outage',
    label:'Outage Maintenance'
  },
  {
    key:'patrol',
    label:'Patrol'
  },
  {
    key:'arboriculture',
    label:'Arboriculture'
  },
  {
    key:'thermal',
    label:'Thermal Viewer'
  }
];

export default function App(){

  const [rows,setRows] = useState([]);

  const [user,setUser] = useState(judges[0].name);

  const [adminPass,setAdminPass] = useState('');

  const [adminLogged,setAdminLogged] = useState(false);

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

  maintenance:'',
  outage:'',
  patrol:'',
  arboriculture:'',
  thermal:'',

  presentation_check:'',
  presentation_analysis:'',
  presentation_qa:'',

  comment:'',

  signed:false

});

  useEffect(()=>{
    loadScores();
  },[]);

  useEffect(()=>{

    setF(prev=>({
      ...prev,
      category:categories[0].key
    }));

  },[user]);

  async function loadScores(){

    const { data,error } = await supabase
      .from('scores')
      .select('*')
      .order('id',{ascending:false});

    if(!error && data){

      setRows(data);

    }

  }

  const exists = rows.some(

    r =>

      r.team === f.team &&
      r.judge === user &&
      r.category === f.category

  );

  async function add(){

    if(!f.signed){

      alert('กรุณายืนยันการตรวจสอบคะแนน');

      return;
    }

    if(exists){

      alert('รายการนี้ถูกลงคะแนนแล้ว');

      return;
    }

    const onsiteTotal =

      Number(f.maintenance || 0) +
      Number(f.outage || 0) +
      Number(f.patrol || 0) +
      Number(f.arboriculture || 0) +
      Number(f.thermal || 0);

    const presentationTotal =

      Number(f.presentation_check || 0) +
      Number(f.presentation_analysis || 0) +
      Number(f.presentation_qa || 0);

    let finalScore = 0;

    if(f.category === 'onsite'){

      finalScore = onsiteTotal;

    }else if(f.category === 'presentation'){

      finalScore = presentationTotal;

    }else{

      finalScore = Number(f.score || 0);

    }

    const payload = {

      team:f.team,
      judge:user,
      role:current.role,
      category:f.category,
      comment:f.comment || '',
      score:finalScore,

      maintenance:Number(f.maintenance || 0),
      outage:Number(f.outage || 0),
      patrol:Number(f.patrol || 0),
      arboriculture:Number(f.arboriculture || 0),
      thermal:Number(f.thermal || 0),

      presentation_check:Number(f.presentation_check || 0),
      presentation_analysis:Number(f.presentation_analysis || 0),
      presentation_qa:Number(f.presentation_qa || 0),

      created_at:new Date().toISOString()

    };

    const { error } = await supabase
      .from('scores')
      .insert([payload]);

    if(error){

      alert(error.message);

      console.log(error);

      return;
    }

    alert('บันทึกคะแนนสำเร็จ');

    setF({

      team:teams[0],

      category:categories[0].key,

      score:'',

      maintenance:'',
      outage:'',
      patrol:'',
      arboriculture:'',
      thermal:'',

      presentation_check:'',
      presentation_analysis:'',
      presentation_qa:'',
comment:'',
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

      const onsiteRows = rs.filter(
        r=>r.category === 'onsite'
      );

      const presentationRows = rs.filter(
        r=>r.category === 'presentation'
      );

      const theoryRows = rs.filter(
        r=>r.category === 'theory'
      );

      const fieldworkRows = rs.filter(
        r=>r.category === 'fieldwork'
      );

      const maintenanceAvg =
        onsiteRows.length
        ? onsiteRows.reduce((a,b)=>a+Number(b.maintenance || 0),0)
          / onsiteRows.length
        : 0;

      const outageAvg =
        onsiteRows.length
        ? onsiteRows.reduce((a,b)=>a+Number(b.outage || 0),0)
          / onsiteRows.length
        : 0;

      const patrolAvg =
        onsiteRows.length
        ? onsiteRows.reduce((a,b)=>a+Number(b.patrol || 0),0)
          / onsiteRows.length
        : 0;

      const arboricultureAvg =
        onsiteRows.length
        ? onsiteRows.reduce((a,b)=>a+Number(b.arboriculture || 0),0)
          / onsiteRows.length
        : 0;

      const thermalAvg =
        onsiteRows.length
        ? onsiteRows.reduce((a,b)=>a+Number(b.thermal || 0),0)
          / onsiteRows.length
        : 0;

      const onsiteTotal =
        maintenanceAvg +
        outageAvg +
        patrolAvg +
        arboricultureAvg +
        thermalAvg;

      const presentationTotal =
  presentationRows.length
  ? presentationRows.reduce(
      (a,b)=>a+Number(b.score || 0),
      0
    ) / presentationRows.length
  : 0;

      const theoryTotal =
        theoryRows.reduce(
          (a,b)=>a+Number(b.score || 0),
          0
        );

      const fieldworkTotal =
        fieldworkRows.reduce(
          (a,b)=>a+Number(b.score || 0),
          0
        );

      const grandTotal =
        onsiteTotal +
        presentationTotal +
        theoryTotal +
        fieldworkTotal;

      return {

        team,

        maintenanceAvg:
          +maintenanceAvg.toFixed(2),

        outageAvg:
          +outageAvg.toFixed(2),

        patrolAvg:
          +patrolAvg.toFixed(2),

        arboricultureAvg:
          +arboricultureAvg.toFixed(2),

        thermalAvg:
          +thermalAvg.toFixed(2),

        onsiteTotal:
          +onsiteTotal.toFixed(2),

        presentationTotal:
          +presentationTotal.toFixed(2),

        theoryTotal:
          +theoryTotal.toFixed(2),

        fieldworkTotal:
          +fieldworkTotal.toFixed(2),

        grandTotal:
          +grandTotal.toFixed(2)

      };

    }).sort(
      (a,b)=>b.grandTotal-a.grandTotal
    );

  },[rows]);

  return (

    <div style={pageStyle}>

      <div style={containerStyle}>

        <div style={heroStyle}>
 <img
    src={logo}
    alt="logo"
    style={{
      width:'100px',
      marginBottom:'20px'
    }}
  />
          <div style={{
            fontSize:'42px',
            fontWeight:'bold'
          }}>
            ⚡ Operation and Maintenance Score System 🏆
          </div>

          <div style={{
            marginTop:'10px',
            fontSize:'22px',
            opacity:0.95
          }}>
            ระบบลงคะแนนการแข่งขันการปฏิบัติการและบำรุงรักษาระบบไฟฟ้า
          </div>

        </div>

        <div style={gridStyle}>

          <div style={cardStyle}>

            <div style={titleStyle}>
              👨‍⚖️ แบบฟอร์มลงคะแนน
            </div>

            <div style={labelStyle}>
              กรรมการ
            </div>

            <select
              value={user}
              onChange={e=>setUser(e.target.value)}
              style={inputStyle}
            >

              {judges.map(j=>(

                <option key={j.name}>
                  {j.name}
                </option>

              ))}

            </select>

            <div style={badgeStyle}>
              {current.role}
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

            {f.category === 'onsite' && (
       <> 
<div style={labelStyle}>
  ข้อเสนอแนะเพิ่มเติม
</div>

<textarea
  rows={5}
  value={f.comment}
  onChange={(e)=>
    setF({
      ...f,
      comment:e.target.value
    })
  }
  placeholder='พิมพ์ข้อสังเกต ข้อเสนอแนะ หรือจุดที่ต้องปรับปรุง'
  style={{
    ...inputStyle,
    minHeight:'120px',
    resize:'vertical'
  }}
/>
              <>
                {onsiteTopics.map(topic=>(

                  <div key={topic.key}>

                    <div style={labelStyle}>
                      {topic.label} (0-12)
                    </div>

                    <input
                      type='number'
                      min='0'
                      max='12'
                      step='0.1'
                      value={f[topic.key]}
                      onChange={e=>{

  const value = e.target.value;

  if(value === ''){

    setF({
      ...f,
      [topic.key]:''
    });

    return;
  }

  let score = Number(value);

  if(score > 12){
    score = 12;
  }

  if(score < 0){
    score = 0;
  }

  setF({
    ...f,
    [topic.key]:score
  });

                      }}
                      style={inputStyle}
                    />

                  </div>

                ))}

                <div style={scoreBoxStyle}>
<div style={labelStyle}>
  ข้อเสนอแนะ / Comment
</div>

<textarea
  rows={5}
  value={f.comment}
  onChange={(e)=>
    setF({
      ...f,
      comment:e.target.value
    })
  }
  placeholder='ระบุข้อสังเกต ข้อดี ข้อควรปรับปรุง'
  style={{
    ...inputStyle,
    minHeight:'120px',
    resize:'vertical'
  }}
/>
                  รวมคะแนน

                  <div style={{
                    fontSize:'32px',
                    marginTop:'10px'
                  }}>
                    {

                      (
                        Number(f.maintenance || 0) +
                        Number(f.outage || 0) +
                        Number(f.patrol || 0) +
                        Number(f.arboriculture || 0) +
                        Number(f.thermal || 0)

                      ).toFixed(1)

                    }

                    / 60

                  </div>

                </div>

              </>

            )}

            {f.category === 'presentation' && (

              <>

                <ScoreInput
                  label='ตรวจสอบสิ่งผิดปกติ'
                  value={f.presentation_check}
                  max={5}
                  onChange={value=>setF({
                    ...f,
                    presentation_check:value
                  })}
                />

                <ScoreInput
                  label='การวิเคราะห์และแก้ไข'
                  value={f.presentation_analysis}
                  max={5}
                  onChange={value=>setF({
                    ...f,
                    presentation_analysis:value
                  })}
                />

                <ScoreInput
                  label='ถาม-ตอบ'
                  value={f.presentation_qa}
                  max={5}
                  onChange={value=>setF({
                    ...f,
                    presentation_qa:value
                  })}
                />

                <div style={scoreBoxStyle}>

                  รวมคะแนน

                  <div style={{
                    fontSize:'32px',
                    marginTop:'10px'
                  }}>
                    {

                      (
                        Number(f.presentation_check || 0) +
                        Number(f.presentation_analysis || 0) +
                        Number(f.presentation_qa || 0)

                      ).toFixed(1)

                    }

                    / 15

                  </div>

                </div>

              </>

            )}

            {f.category === 'theory' && (

              <ScoreInput
                label='คะแนนภาคทฤษฎี'
                value={f.score}
                max={15}
                onChange={value=>setF({
                  ...f,
                  score:value
                })}
              />

            )}

            {f.category === 'fieldwork' && (

              <ScoreInput
                label='คะแนนแข่งภาคสนาม'
                value={f.score}
                max={10}
                onChange={value=>setF({
                  ...f,
                  score:value
                })}
              />

            )}

            <label style={checkStyle}>

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
                color:'#ef4444',
                fontWeight:'bold',
                marginTop:'15px'
              }}>
                ⚠ ลงคะแนนรายการนี้แล้ว
              </div>

            )}

            <button
              disabled={!f.signed || exists}
              onClick={add}
              style={{
                ...buttonStyle,
                opacity:
                  (!f.signed || exists)
                  ? 0.5
                  : 1
              }}
            >
              🚀 ส่งคะแนน
            </button>
 </>
)}
          </div>
</>
          <div style={cardStyle}>

            <div style={titleStyle}>
              📋 คะแนนที่ฉันลงไว้
            </div>

            <div style={{
              overflow:'auto'
            }}>

              <table style={tableStyle}>

                <thead>

                  <tr style={theadStyle}>

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

        </div>

        <div style={{
          ...cardStyle,
          marginTop:'25px'
        }}>

          <div style={titleStyle}>
            🔒 ตารางคะแนนรวม
          </div>

          {!adminLogged ? (

            <>

              <input
                type='password'
                placeholder='กรอกรหัสผ่าน'
                value={adminPass}
                onChange={e=>setAdminPass(
                  e.target.value
                )}
                style={inputStyle}
              />

              <button
                onClick={()=>{

                  if(adminPass === 'test2026'){

                    setAdminLogged(true);

                  }else{

                    alert('รหัสผ่านไม่ถูกต้อง');

                  }

                }}
                style={buttonStyle}
              >
                LOGIN
              </button>

            </>

          ) : (

            <div style={{
              overflow:'auto'
            }}>

              <table style={{
                ...tableStyle,
                minWidth:'1400px'
              }}>

                <thead>

                  <tr style={theadStyle}>

                    <th style={thStyle}>อันดับ</th>
                    <th style={thStyle}>ทีม</th>
                    <th style={thStyle}>Maintenance</th>
                    <th style={thStyle}>Outage</th>
                    <th style={thStyle}>Patrol</th>
                    <th style={thStyle}>Arboriculture</th>
                    <th style={thStyle}>Thermal</th>
                    <th style={thStyle}>รวมหน้างาน</th>
                    <th style={thStyle}>Presentation</th>
                    <th style={thStyle}>Theory</th>
                    <th style={thStyle}>Fieldwork</th>
                    <th style={thStyle}>Grand Total</th>
<th style={thStyle}>Comment</th>
                  </tr>

                </thead>

                <tbody>

                  {ranking.map((r,i)=>(
<div style={{marginTop:'40px'}}>

  <div style={titleStyle}>
    📝 ความคิดเห็นจากกรรมการ
  </div>

  <table style={tableStyle}>

    <thead>

      <tr style={theadStyle}>

        <th style={thStyle}>ทีม</th>
        <th style={thStyle}>กรรมการ</th>
        <th style={thStyle}>ประเภท</th>
        <th style={thStyle}>คะแนน</th>
        <th style={thStyle}>Comment</th>

      </tr>

    </thead>

    <tbody>

      {rows
        .filter(r=>r.comment)
        .map((r,i)=>(

        <tr key={i}>

          <td style={tdStyle}>
            {r.team}
          </td>

          <td style={tdStyle}>
            {r.judge}
          </td>

          <td style={tdStyle}>
            {r.category}
          </td>

          <td style={tdStyle}>
            {r.score}
          </td>

          <td
            style={{
              ...tdStyle,
              textAlign:'left',
              maxWidth:'500px'
            }}
          >
            {r.comment}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
                    <tr key={i}>

                      <td style={tdStyle}>
                        {i+1}
                      </td>

                      <td style={tdStyle}>
                        <b>{r.team}</b>
                      </td>

                      <td style={tdStyle}>
                        {r.maintenanceAvg}
                      </td>

                      <td style={tdStyle}>
                        {r.outageAvg}
                      </td>

                      <td style={tdStyle}>
                        {r.patrolAvg}
                      </td>

                      <td style={tdStyle}>
                        {r.arboricultureAvg}
                      </td>

                      <td style={tdStyle}>
                        {r.thermalAvg}
                      </td>

                      <td style={{
                        ...tdStyle,
                        background:'#dbeafe',
                        fontWeight:'bold'
                      }}>
                        {r.onsiteTotal}
                      </td>

                      <td style={tdStyle}>
                        {r.presentationTotal}
                      </td>

                      <td style={tdStyle}>
                        {r.theoryTotal}
                      </td>

                      <td style={tdStyle}>
                        {r.fieldworkTotal}
                      </td>

                      <td style={{
                        ...tdStyle,
                        background:'#dcfce7',
                        fontWeight:'bold',
                        fontSize:'18px'
                      }}>
                        {r.grandTotal}
                      </td>
<td
  style={{
    ...tdStyle,
    textAlign:'left',
    minWidth:'350px'
  }}
>
  {rows
    .filter(
      x =>
        x.team === r.team &&
        x.category === 'onsite' &&
        x.comment
    )
    .map((x,i)=>(
      <div key={i}>
        <b>{x.judge}</b> : {x.comment}
      </div>
    ))
  }
</td>
                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

function ScoreInput({
  label,
  value,
  max,
  onChange
}){

  return (

    <>

      <div style={labelStyle}>
        {label} (0-{max})
      </div>

      <input
        type='number'
        min='0'
        max={max}
        step='0.1'
        value={value}
       onChange={e=>{

  const value = e.target.value;

  if(value === ''){
    onChange('');
    return;
  }

  let v = Number(value);

  if(v > max){
    v = max;
  }

  if(v < 0){
    v = 0;
  }

  onChange(v);

        }}
        style={inputStyle}
      />

    </>

  );

}

const pageStyle = {
  minHeight:'100vh',
  background:'linear-gradient(135deg,#020617,#0f172a,#1e3a8a,#0ea5e9)',
  padding:'30px',
  fontFamily:'sans-serif'
};

const containerStyle = {
  maxWidth:'1600px',
  margin:'0 auto'
};

const heroStyle = {
  background:'rgba(255,255,255,0.1)',
  border:'1px solid rgba(255,255,255,0.12)',
  backdropFilter:'blur(14px)',
  borderRadius:'30px',
  padding:'35px',
  color:'#fff',
  marginBottom:'30px',
  boxShadow:'0 15px 40px rgba(0,0,0,0.25)'
};

const gridStyle = {
  display:'grid',
  gridTemplateColumns:'1fr 1fr',
  gap:'25px'
};

const cardStyle = {
  background:'rgba(255,255,255,0.97)',
  borderRadius:'28px',
  padding:'28px',
  boxShadow:'0 20px 40px rgba(0,0,0,0.15)'
};

const titleStyle = {
  fontSize:'30px',
  fontWeight:'bold',
  marginBottom:'22px',
  color:'#0f172a'
};

const labelStyle = {
  marginTop:'16px',
  marginBottom:'8px',
  fontWeight:'bold',
  color:'#334155'
};

const inputStyle = {
  width:'100%',
  padding:'14px',
  borderRadius:'16px',
  border:'1px solid #cbd5e1',
  fontSize:'16px',
  boxSizing:'border-box'
};

const buttonStyle = {
  width:'100%',
  marginTop:'25px',
  padding:'16px',
  border:'none',
  borderRadius:'18px',
  background:'linear-gradient(90deg,#2563eb,#06b6d4)',
  color:'#fff',
  fontWeight:'bold',
  fontSize:'18px',
  cursor:'pointer',
  boxShadow:'0 10px 20px rgba(37,99,235,0.3)'
};

const badgeStyle = {
  marginTop:'12px',
  background:'#dbeafe',
  color:'#1d4ed8',
  padding:'12px',
  borderRadius:'14px',
  fontWeight:'bold'
};

const checkStyle = {
  display:'flex',
  alignItems:'center',
  gap:'10px',
  marginTop:'22px',
  fontWeight:'bold'
};

const scoreBoxStyle = {
  marginTop:'22px',
  padding:'20px',
  borderRadius:'20px',
  background:'linear-gradient(135deg,#2563eb,#06b6d4)',
  color:'#fff',
  textAlign:'center',
  fontWeight:'bold'
};

const tableStyle = {
  width:'100%',
  borderCollapse:'collapse'
};

const theadStyle = {
  background:'#eff6ff'
};

const thStyle = {
  padding:'14px',
  textAlign:'center',
  borderBottom:'1px solid #dbeafe'
};

const tdStyle = {
  padding:'14px',
  textAlign:'center',
  borderBottom:'1px solid #f1f5f9'
};
