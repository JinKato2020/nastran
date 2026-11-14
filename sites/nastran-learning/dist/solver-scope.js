(() => {
 'use strict';
 const support='https://support.industrysoftware.automation.siemens.com/docs_general/simcenter/';
 const training='https://training.plm.automation.siemens.com/ilt/iltdescription.cfm?pID=NAS401-402_S3DNAS__2021.2_B3';
 const basic=new Set(['static','modes','buckling','direct-frequency','modal-frequency','transient']);
 const nonlinear={
  'large-deformation':{
   msc:'MSCのSOL 400例では、幾何学的非線形と弧長法の設定を確認します。',
   steps:[['解析手順を選ぶ','SimcenterのSOL 401／402のうち、大変位・大回転と荷重経路に必要な機能がある方を選びます。スナップスルーを追跡する場合は、変位制御と弧長法の適用範囲を使用版の資料で確認します。'],['結果を比較する','荷重点の変位と対応する荷重を同じ位置・方向で追い、極限点の前後で応答の枝がどう変わるか確認します。']]},
  plasticity:{
   msc:'MSCのSOL 106例では、塑性域に達する載荷と、その後の除荷を区別します。',
   steps:[['材料と載荷履歴を確認する','採用するSOLの材料入力で、降伏条件・硬化則・入力するひずみの定義を確認します。載荷と除荷を連続した履歴として設定し、塑性状態を引き継ぐ条件を確認します。'],['結果を比較する','荷重と変位の履歴、塑性ひずみ、荷重を取り除いた時点の残留変位を確認します。']]},
  contact:{
   msc:'MSCの浮き上がり例はSOL 106、三次元接触・ボルト締付けはSOL 400の設定として確認します。',
   steps:[['接触の条件を整理する','接触面、初期間隙、摩擦則を指定し、採用するSOLで有効な設定と出力を確認します。ボルトを扱う場合は、締付け・締付け状態の保持・外力の各段階で引き継ぐ条件を確認します。'],['結果を比較する','接触が開く位置、接触力・すべり、ボルト軸力を段階ごとに確認し、反力と外力の釣り合いを照合します。']]}
 };
 const analysisNote=key=>basic.has(key)
  ? '理論と解析の流れは「Nastran共通」で学べます。この画面の入力・相関図・例題はMSC版を対象にしています。'
  : 'この画面の解析手順・入力例はMSC版を対象にしています。Simcenterでの入力仕様は使用版の公式資料で確認してください。';
 const cardNote=key=>({
  EXEC_SOL_400:'このページのSOL 400はMSCの非線形手順です。SimcenterではSOL 401／402の適用範囲を確認します。',
  NLSTEP:'掲載のNLSTEPはMSC SOL 400の設定です。Simcenterでのステップ設定は、採用するSOLの公式資料で確認します。',
  BOLT:'ここで示す欄・参照関係はMSCの資料に基づきます。Simcenterでは採用するSOLで使えるボルト定義と荷重段階を確認します。',
  CASE_STATSUB:'掲載例はMSC版です。Simcenterでは、参照するサブケースと予荷重状態の引き継ぎ条件を確認します。'
 })[key];
 window.SolverScope={support,training,basic,nonlinear,analysisNote,cardNote};
})();
