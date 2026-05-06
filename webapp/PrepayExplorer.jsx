import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─────────────────────────────────────────────────────────────────
//  Inlined model artefacts. Regenerate by re-running the harvest
//  helper described in the comment block at the bottom of this file.
// ─────────────────────────────────────────────────────────────────
const MODEL_DATA = {"meta":{"intercept":-6.583065278239806,"feature_names":["refi_lin","refi_k-150","refi_k-50","refi_k0","refi_k50","refi_k100","refi_k150","refi_k250","age_lin","age_k12","age_k36","age_k60","age_k84","age_k120","age_k180","pen_lin","pen_k0","pen_k2","pen_k5","pen_k8","sato_lin","sato_k-100","sato_k-25","sato_k25","sato_k100","size_lin","size_k2","size_k10","size_k25","m2m_lin","m2m_k12","m2m_k24","m2m_k60","mpl_lin","mpl_k6","mpl_k12","mpl_k24","refi_x_pen","in_penalty","fha_221d4","fha_223a7","fha_232","fha_538","fha_241","fha_220","fha_other","is_nc","aff_aff","aff_baf","aff_mkt","is_lm_pool","is_pn_pool","is_ls_pool","is_rx_pool"],"knots":{"refi":[-150,-50,0,50,100,150,250],"age":[12,36,60,84,120,180],"pen":[0,2,5,8],"sato":[-100,-25,25,100],"size":[2,10,25],"m2m":[12,24,60],"mpl":[6,12,24]},"train_period_min":"201812","train_period_max":"202406","test_period_min":"202407","test_period_max":"202603","train_n":932014,"test_n":308876,"train_events":8881,"test_events":749,"train_auc":0.7692501007426275,"test_auc":0.5860360155240988,"train_pred_cpr_pct":10.844768157311824,"test_pred_cpr_pct":4.247882960521454,"train_actual_cpr_pct":10.85395435171186,"test_actual_cpr_pct":2.8714079823017324},"coefficients":{"refi_lin":0.004320370927372,"refi_k-150":0.0022721146269841,"refi_k-50":0.0017670998050352,"refi_k0":0.0009122345816079,"refi_k50":-0.0015626207332975,"refi_k100":-0.0034164294637231,"refi_k150":-0.0023538753564155,"refi_k250":-0.0009769816688914,"age_lin":0.0059010869128381,"age_k12":0.0053604490113782,"age_k36":0.0005680631854614,"age_k60":-0.0029967448368979,"age_k84":-0.0049135452115772,"age_k120":-0.0194994193608194,"age_k180":0.0205522570183075,"pen_lin":0.0218860018022879,"pen_k0":0.0218860018022879,"pen_k2":-0.0527471852017386,"pen_k5":-0.0067666103237343,"pen_k8":0.0415181393553758,"sato_lin":-0.0012081854075442,"sato_k-100":0.0016515061578033,"sato_k-25":-0.0006815554563151,"sato_k25":-0.0015030342534118,"sato_k100":-0.0048348329501202,"size_lin":0.0531506156077567,"size_k2":0.038992644258368,"size_k10":-0.0596512523519153,"size_k25":-0.0308547139487613,"m2m_lin":-0.0004235851639883,"m2m_k12":-0.0001961457862516,"m2m_k24":9.162519761975138e-05,"m2m_k60":0.0009516060403751,"mpl_lin":-0.0062609994128686,"mpl_k6":-0.0035252507547331,"mpl_k12":0.0001795012225122,"mpl_k24":0.0121055796456898,"refi_x_pen":0.0834288442995806,"in_penalty":-0.4255794748139353,"fha_221d4":0.0656699859254043,"fha_223a7":-0.0530921864160268,"fha_232":-0.1964313273555558,"fha_538":-0.7103382360670417,"fha_241":0.1875957922750205,"fha_220":-0.5003933159449199,"fha_other":-0.0264073808695201,"is_nc":-0.1644100448391538,"aff_aff":0.2304690120874516,"aff_baf":-0.087625314228744,"aff_mkt":0.6817414554613862,"is_lm_pool":-0.0914951340432474,"is_pn_pool":0.128498289081244,"is_ls_pool":-0.0025069756911412,"is_rx_pool":-0.4785349424700878,"__intercept__":-6.583065278239806},"calibration":[{"decile":0,"n":30888.0,"upb_mn":84051.0533,"pred_smm":0.0006,"actual_smm":0.0009,"pred_cpr":0.7745,"actual_cpr":1.0272},{"decile":1,"n":30888.0,"upb_mn":145650.3198,"pred_smm":0.0011,"actual_smm":0.0008,"pred_cpr":1.2953,"actual_cpr":1.0063},{"decile":2,"n":30887.0,"upb_mn":216051.8965,"pred_smm":0.0015,"actual_smm":0.0009,"pred_cpr":1.7567,"actual_cpr":1.0891},{"decile":3,"n":30888.0,"upb_mn":259475.0408,"pred_smm":0.0019,"actual_smm":0.0009,"pred_cpr":2.2616,"actual_cpr":1.1191},{"decile":4,"n":30887.0,"upb_mn":291383.0569,"pred_smm":0.0024,"actual_smm":0.0012,"pred_cpr":2.8393,"actual_cpr":1.4498},{"decile":5,"n":30888.0,"upb_mn":353108.5297,"pred_smm":0.003,"actual_smm":0.0013,"pred_cpr":3.4865,"actual_cpr":1.5433},{"decile":6,"n":30887.0,"upb_mn":414148.3755,"pred_smm":0.0036,"actual_smm":0.0018,"pred_cpr":4.2442,"actual_cpr":2.0887},{"decile":7,"n":30888.0,"upb_mn":454247.2324,"pred_smm":0.0045,"actual_smm":0.0015,"pred_cpr":5.3178,"actual_cpr":1.7681},{"decile":8,"n":30887.0,"upb_mn":470362.1077,"pred_smm":0.0061,"actual_smm":0.0013,"pred_cpr":7.1027,"actual_cpr":1.6049},{"decile":9,"n":30888.0,"upb_mn":443978.091,"pred_smm":0.0115,"actual_smm":0.0023,"pred_cpr":12.9664,"actual_cpr":2.7004}],"segments":[{"segment_field":"loan_purpose","segment_value":"538","n":24958,"upb_mn":37766.7644,"pred_cpr":1.2831,"actual_cpr":1.2174},{"segment_field":"loan_purpose","segment_value":"NC","n":42003,"upb_mn":660489.0558,"pred_cpr":5.5929,"actual_cpr":1.2316},{"segment_field":"loan_purpose","segment_value":"OTHER","n":3340,"upb_mn":36326.3687,"pred_cpr":7.4987,"actual_cpr":1.6318},{"segment_field":"loan_purpose","segment_value":"RP","n":238575,"upb_mn":2397873.5148,"pred_cpr":5.3092,"actual_cpr":1.8484},{"segment_field":"fha_category","segment_value":"220","n":608,"upb_mn":24464.1497,"pred_cpr":4.1405,"actual_cpr":0.3828},{"segment_field":"fha_category","segment_value":"221d4","n":53960,"upb_mn":755454.6131,"pred_cpr":5.4552,"actual_cpr":0.8627},{"segment_field":"fha_category","segment_value":"223a7","n":28624,"upb_mn":205450.2085,"pred_cpr":4.1429,"actual_cpr":1.3222},{"segment_field":"fha_category","segment_value":"223f","n":117313,"upb_mn":1300382.2464,"pred_cpr":5.1457,"actual_cpr":1.2834},{"segment_field":"fha_category","segment_value":"232","n":77961,"upb_mn":752531.681,"pred_cpr":5.9012,"actual_cpr":3.0671},{"segment_field":"fha_category","segment_value":"241","n":2112,"upb_mn":20079.6718,"pred_cpr":10.6229,"actual_cpr":15.304},{"segment_field":"fha_category","segment_value":"538","n":24958,"upb_mn":37766.7644,"pred_cpr":1.2831,"actual_cpr":1.2174},{"segment_field":"fha_category","segment_value":"OTHER","n":3340,"upb_mn":36326.3687,"pred_cpr":7.4987,"actual_cpr":1.6318},{"segment_field":"affordable_status","segment_value":"","n":33104,"upb_mn":181678.547,"pred_cpr":5.7753,"actual_cpr":2.683},{"segment_field":"affordable_status","segment_value":"AFF","n":12079,"upb_mn":167964.9981,"pred_cpr":3.7469,"actual_cpr":1.1431},{"segment_field":"affordable_status","segment_value":"BAF","n":49755,"upb_mn":558054.3555,"pred_cpr":2.7647,"actual_cpr":0.5044},{"segment_field":"affordable_status","segment_value":"MKT","n":213938,"upb_mn":2224757.8032,"pred_cpr":6.0692,"actual_cpr":1.9712}],"monthlyOverall":[{"period":201812,"n":13682,"upb_mn":104970.94,"pred_cpr":5.0341,"actual_cpr":5.4276},{"period":201901,"n":13674,"upb_mn":105269.53,"pred_cpr":5.1592,"actual_cpr":1.2593},{"period":201902,"n":13722,"upb_mn":105937.87,"pred_cpr":5.0976,"actual_cpr":4.4771},{"period":201903,"n":13719,"upb_mn":106022.17,"pred_cpr":6.2596,"actual_cpr":3.8441},{"period":201904,"n":13768,"upb_mn":106937.58,"pred_cpr":6.7602,"actual_cpr":3.1428},{"period":201905,"n":13789,"upb_mn":107371.1,"pred_cpr":9.4969,"actual_cpr":2.3188},{"period":201906,"n":13817,"upb_mn":108170.97,"pred_cpr":9.8385,"actual_cpr":5.8532},{"period":201907,"n":13855,"upb_mn":108651.35,"pred_cpr":11.0532,"actual_cpr":6.528},{"period":201908,"n":13880,"upb_mn":108759.77,"pred_cpr":15.4685,"actual_cpr":4.9417},{"period":201909,"n":13915,"upb_mn":109502.25,"pred_cpr":13.2038,"actual_cpr":7.1358},{"period":201910,"n":13944,"upb_mn":110073.8,"pred_cpr":13.6121,"actual_cpr":12.5805},{"period":201911,"n":13956,"upb_mn":110217.09,"pred_cpr":11.2522,"actual_cpr":7.6036},{"period":201912,"n":14017,"upb_mn":111193.71,"pred_cpr":9.8177,"actual_cpr":10.6536},{"period":202001,"n":14006,"upb_mn":111791.77,"pred_cpr":14.9317,"actual_cpr":9.7931},{"period":202002,"n":13999,"upb_mn":112171.71,"pred_cpr":18.6168,"actual_cpr":16.8468},{"period":202003,"n":13988,"upb_mn":112300.83,"pred_cpr":18.8807,"actual_cpr":17.3383},{"period":202004,"n":14004,"upb_mn":112841.7,"pred_cpr":22.2373,"actual_cpr":18.9861},{"period":202005,"n":14008,"upb_mn":113277.14,"pred_cpr":23.4552,"actual_cpr":23.9688},{"period":202006,"n":14022,"upb_mn":113297.75,"pred_cpr":24.2836,"actual_cpr":23.894},{"period":202007,"n":14040,"upb_mn":114427.8,"pred_cpr":28.8718,"actual_cpr":26.9588},{"period":202008,"n":14047,"upb_mn":114997.37,"pred_cpr":29.849,"actual_cpr":22.1189},{"period":202009,"n":14036,"upb_mn":115594.42,"pred_cpr":29.7277,"actual_cpr":29.1631},{"period":202010,"n":14003,"upb_mn":115397.02,"pred_cpr":23.7299,"actual_cpr":29.8236},{"period":202011,"n":13934,"upb_mn":115186.95,"pred_cpr":24.75,"actual_cpr":28.7749},{"period":202012,"n":13905,"upb_mn":116020.35,"pred_cpr":25.4633,"actual_cpr":40.5609},{"period":202101,"n":13796,"upb_mn":114965.21,"pred_cpr":23.803,"actual_cpr":29.4716},{"period":202102,"n":13794,"upb_mn":115693.65,"pred_cpr":19.7365,"actual_cpr":37.1169},{"period":202103,"n":13788,"upb_mn":115867.34,"pred_cpr":15.6688,"actual_cpr":27.3915},{"period":202104,"n":13791,"upb_mn":116660.04,"pred_cpr":16.9626,"actual_cpr":30.6775},{"period":202105,"n":13783,"upb_mn":117285.77,"pred_cpr":19.1001,"actual_cpr":24.1701},{"period":202106,"n":13739,"upb_mn":117173.79,"pred_cpr":20.8767,"actual_cpr":23.9531},{"period":202107,"n":13716,"upb_mn":118222.37,"pred_cpr":23.0348,"actual_cpr":21.325},{"period":202108,"n":13693,"upb_mn":118691.73,"pred_cpr":20.8884,"actual_cpr":21.605},{"period":202109,"n":13724,"upb_mn":119554.02,"pred_cpr":19.415,"actual_cpr":28.0449},{"period":202110,"n":13699,"upb_mn":119374.07,"pred_cpr":18.6495,"actual_cpr":24.2878},{"period":202111,"n":13722,"upb_mn":120348.11,"pred_cpr":17.9951,"actual_cpr":29.7496},{"period":202112,"n":13718,"upb_mn":121056.4,"pred_cpr":16.1547,"actual_cpr":32.2558},{"period":202201,"n":13592,"upb_mn":119787.61,"pred_cpr":13.0524,"actual_cpr":14.9588},{"period":202202,"n":13662,"upb_mn":121000.04,"pred_cpr":10.4954,"actual_cpr":14.4191},{"period":202203,"n":13697,"upb_mn":122182.49,"pred_cpr":7.0,"actual_cpr":13.3551},{"period":202204,"n":13722,"upb_mn":123401.03,"pred_cpr":4.4248,"actual_cpr":13.9593},{"period":202205,"n":13781,"upb_mn":124483.98,"pred_cpr":7.8174,"actual_cpr":14.5428},{"period":202206,"n":13768,"upb_mn":124777.25,"pred_cpr":6.4788,"actual_cpr":10.1633},{"period":202207,"n":13771,"upb_mn":125125.99,"pred_cpr":7.7211,"actual_cpr":5.2912},{"period":202208,"n":13795,"upb_mn":126057.67,"pred_cpr":5.6942,"actual_cpr":7.3793},{"period":202209,"n":13791,"upb_mn":127163.98,"pred_cpr":4.0105,"actual_cpr":10.4545},{"period":202210,"n":13784,"upb_mn":127119.73,"pred_cpr":3.2907,"actual_cpr":4.6891},{"period":202211,"n":13832,"upb_mn":128468.44,"pred_cpr":4.2373,"actual_cpr":3.355},{"period":202212,"n":13881,"upb_mn":129813.78,"pred_cpr":4.0209,"actual_cpr":3.2707},{"period":202301,"n":13907,"upb_mn":130439.05,"pred_cpr":4.8859,"actual_cpr":1.5127},{"period":202302,"n":13954,"upb_mn":131377.07,"pred_cpr":4.3749,"actual_cpr":1.3719},{"period":202303,"n":13996,"upb_mn":132250.21,"pred_cpr":4.4753,"actual_cpr":2.9947},{"period":202304,"n":14016,"upb_mn":132876.29,"pred_cpr":4.337,"actual_cpr":1.1548},{"period":202305,"n":14063,"upb_mn":133576.9,"pred_cpr":3.8553,"actual_cpr":1.1284},{"period":202306,"n":14098,"upb_mn":134213.9,"pred_cpr":3.7683,"actual_cpr":2.2763},{"period":202307,"n":14115,"upb_mn":134664.55,"pred_cpr":3.5785,"actual_cpr":1.11},{"period":202308,"n":14147,"upb_mn":135465.17,"pred_cpr":3.3997,"actual_cpr":2.2279},{"period":202309,"n":14179,"upb_mn":135946.31,"pred_cpr":2.7397,"actual_cpr":2.1524},{"period":202310,"n":14239,"upb_mn":137484.35,"pred_cpr":2.3093,"actual_cpr":4.2719},{"period":202311,"n":14272,"upb_mn":137755.66,"pred_cpr":3.1432,"actual_cpr":2.6939},{"period":202312,"n":14269,"upb_mn":138041.98,"pred_cpr":4.2491,"actual_cpr":1.5517},{"period":202401,"n":14281,"upb_mn":138145.45,"pred_cpr":4.2678,"actual_cpr":1.2812},{"period":202402,"n":14305,"upb_mn":138743.27,"pred_cpr":3.8785,"actual_cpr":0.8144},{"period":202403,"n":14341,"upb_mn":139306.69,"pred_cpr":3.9879,"actual_cpr":2.3503},{"period":202404,"n":14335,"upb_mn":139375.08,"pred_cpr":3.1795,"actual_cpr":0.633},{"period":202405,"n":14358,"upb_mn":139737.89,"pred_cpr":3.5635,"actual_cpr":0.8539},{"period":202406,"n":14396,"upb_mn":140581.89,"pred_cpr":3.8207,"actual_cpr":1.0875},{"period":202407,"n":14403,"upb_mn":140965.31,"pred_cpr":4.5116,"actual_cpr":0.905},{"period":202408,"n":14440,"upb_mn":141751.74,"pred_cpr":4.8459,"actual_cpr":0.9201},{"period":202409,"n":14481,"upb_mn":142539.58,"pred_cpr":5.494,"actual_cpr":0.6055},{"period":202410,"n":14512,"upb_mn":143414.64,"pred_cpr":4.268,"actual_cpr":1.8362},{"period":202411,"n":14544,"upb_mn":144105.95,"pred_cpr":4.6819,"actual_cpr":1.7749},{"period":202412,"n":14578,"upb_mn":145206.6,"pred_cpr":3.9587,"actual_cpr":1.4557},{"period":202501,"n":14583,"upb_mn":145634.19,"pred_cpr":3.9856,"actual_cpr":0.834},{"period":202502,"n":14608,"upb_mn":146541.71,"pred_cpr":4.5791,"actual_cpr":1.7237},{"period":202503,"n":14633,"upb_mn":147419.33,"pred_cpr":4.5033,"actual_cpr":1.8166},{"period":202504,"n":14663,"upb_mn":147948.87,"pred_cpr":4.2616,"actual_cpr":1.6669},{"period":202505,"n":14683,"upb_mn":148768.07,"pred_cpr":3.8489,"actual_cpr":1.347},{"period":202506,"n":14728,"upb_mn":149590.84,"pred_cpr":4.2969,"actual_cpr":2.1148},{"period":202507,"n":14753,"upb_mn":150370.0,"pred_cpr":4.0933,"actual_cpr":3.7958},{"period":202508,"n":14775,"upb_mn":151090.64,"pred_cpr":4.5486,"actual_cpr":1.1873},{"period":202509,"n":14829,"upb_mn":152350.05,"pred_cpr":4.9484,"actual_cpr":0.7487},{"period":202510,"n":14887,"upb_mn":153576.48,"pred_cpr":5.2137,"actual_cpr":4.563},{"period":202511,"n":14918,"upb_mn":154717.8,"pred_cpr":5.5937,"actual_cpr":0.9602},{"period":202512,"n":14992,"upb_mn":156657.03,"pred_cpr":5.5241,"actual_cpr":4.6543},{"period":202601,"n":14971,"upb_mn":156591.41,"pred_cpr":6.1495,"actual_cpr":1.3176},{"period":202602,"n":14966,"upb_mn":156896.66,"pred_cpr":7.0173,"actual_cpr":1.2826},{"period":202603,"n":14971,"upb_mn":157587.95,"pred_cpr":5.3738,"actual_cpr":0.0}],"monthlyByCat":{"220":[{"period":201812,"pred_cpr":7.7928,"actual_cpr":0.0,"n":31},{"period":201901,"pred_cpr":7.8732,"actual_cpr":0.0,"n":31},{"period":201902,"pred_cpr":7.7805,"actual_cpr":0.0,"n":31},{"period":201903,"pred_cpr":9.1349,"actual_cpr":0.0,"n":31},{"period":201904,"pred_cpr":10.388,"actual_cpr":0.0103,"n":32},{"period":201905,"pred_cpr":13.5349,"actual_cpr":0.0,"n":31},{"period":201906,"pred_cpr":13.7057,"actual_cpr":0.0,"n":32},{"period":201907,"pred_cpr":15.0371,"actual_cpr":0.0,"n":32},{"period":201908,"pred_cpr":20.1481,"actual_cpr":0.0,"n":32},{"period":201909,"pred_cpr":17.606,"actual_cpr":0.0,"n":32},{"period":201910,"pred_cpr":18.3832,"actual_cpr":66.9454,"n":32},{"period":201911,"pred_cpr":14.7708,"actual_cpr":0.0,"n":31},{"period":201912,"pred_cpr":13.4364,"actual_cpr":0.0,"n":31},{"period":202001,"pred_cpr":18.1779,"actual_cpr":61.9865,"n":31},{"period":202002,"pred_cpr":19.7107,"actual_cpr":0.0,"n":30},{"period":202003,"pred_cpr":20.1342,"actual_cpr":60.9913,"n":30},{"period":202004,"pred_cpr":22.4922,"actual_cpr":73.8834,"n":30},{"period":202005,"pred_cpr":23.3305,"actual_cpr":0.0,"n":28},{"period":202006,"pred_cpr":24.5743,"actual_cpr":0.0,"n":28},{"period":202007,"pred_cpr":29.6612,"actual_cpr":0.0,"n":29},{"period":202008,"pred_cpr":31.2203,"actual_cpr":0.0,"n":29},{"period":202009,"pred_cpr":30.9661,"actual_cpr":0.0,"n":30},{"period":202010,"pred_cpr":23.8815,"actual_cpr":0.0,"n":31},{"period":202011,"pred_cpr":25.7285,"actual_cpr":0.0,"n":31},{"period":202012,"pred_cpr":27.3267,"actual_cpr":77.7489,"n":31},{"period":202101,"pred_cpr":24.8707,"actual_cpr":41.5768,"n":29},{"period":202102,"pred_cpr":19.0632,"actual_cpr":74.7172,"n":29},{"period":202103,"pred_cpr":15.8445,"actual_cpr":81.2046,"n":28},{"period":202104,"pred_cpr":15.3446,"actual_cpr":92.3384,"n":27},{"period":202105,"pred_cpr":17.6998,"actual_cpr":0.0,"n":28},{"period":202106,"pred_cpr":20.3494,"actual_cpr":12.4139,"n":28},{"period":202107,"pred_cpr":21.8738,"actual_cpr":0.0,"n":28},{"period":202108,"pred_cpr":19.7325,"actual_cpr":0.0,"n":28},{"period":202109,"pred_cpr":18.3465,"actual_cpr":6.2898,"n":28},{"period":202110,"pred_cpr":18.3437,"actual_cpr":0.0,"n":27},{"period":202111,"pred_cpr":18.3702,"actual_cpr":40.7321,"n":28},{"period":202112,"pred_cpr":15.4317,"actual_cpr":0.0,"n":28},{"period":202201,"pred_cpr":12.2572,"actual_cpr":0.0,"n":28},{"period":202202,"pred_cpr":9.3759,"actual_cpr":0.0,"n":28},{"period":202203,"pred_cpr":6.3128,"actual_cpr":0.0,"n":28},{"period":202204,"pred_cpr":4.2779,"actual_cpr":0.0,"n":28},{"period":202205,"pred_cpr":8.1862,"actual_cpr":0.0,"n":29},{"period":202206,"pred_cpr":6.9688,"actual_cpr":0.0,"n":29},{"period":202207,"pred_cpr":8.2018,"actual_cpr":0.0,"n":29},{"period":202208,"pred_cpr":6.1221,"actual_cpr":55.2885,"n":29},{"period":202209,"pred_cpr":3.9129,"actual_cpr":0.0,"n":28},{"period":202210,"pred_cpr":3.2576,"actual_cpr":0.0,"n":28},{"period":202211,"pred_cpr":4.1763,"actual_cpr":0.0,"n":28},{"period":202212,"pred_cpr":3.9455,"actual_cpr":0.0,"n":28},{"period":202301,"pred_cpr":4.7421,"actual_cpr":0.0,"n":28},{"period":202302,"pred_cpr":4.1524,"actual_cpr":0.0,"n":29},{"period":202303,"pred_cpr":4.2549,"actual_cpr":0.0,"n":29},{"period":202304,"pred_cpr":4.0751,"actual_cpr":0.0,"n":25},{"period":202305,"pred_cpr":3.6037,"actual_cpr":0.0,"n":25},{"period":202306,"pred_cpr":3.5233,"actual_cpr":0.0,"n":25},{"period":202307,"pred_cpr":3.2942,"actual_cpr":0.0,"n":25},{"period":202308,"pred_cpr":3.0679,"actual_cpr":0.0,"n":25},{"period":202309,"pred_cpr":2.4477,"actual_cpr":0.0,"n":26},{"period":202310,"pred_cpr":2.0362,"actual_cpr":0.0,"n":26},{"period":202311,"pred_cpr":2.7603,"actual_cpr":0.0,"n":26},{"period":202312,"pred_cpr":3.6007,"actual_cpr":0.0,"n":26},{"period":202401,"pred_cpr":3.6096,"actual_cpr":0.0,"n":26},{"period":202402,"pred_cpr":3.3018,"actual_cpr":0.0,"n":26},{"period":202403,"pred_cpr":3.4295,"actual_cpr":0.0,"n":26},{"period":202404,"pred_cpr":2.8054,"actual_cpr":0.0,"n":26},{"period":202405,"pred_cpr":3.0939,"actual_cpr":0.0,"n":27},{"period":202406,"pred_cpr":3.2887,"actual_cpr":0.0,"n":27},{"period":202407,"pred_cpr":3.793,"actual_cpr":4.38,"n":27},{"period":202408,"pred_cpr":3.8488,"actual_cpr":0.0,"n":27},{"period":202409,"pred_cpr":4.0725,"actual_cpr":0.0,"n":28},{"period":202410,"pred_cpr":3.2606,"actual_cpr":0.0,"n":29},{"period":202411,"pred_cpr":3.5335,"actual_cpr":0.0,"n":29},{"period":202412,"pred_cpr":3.0613,"actual_cpr":0.0,"n":29},{"period":202501,"pred_cpr":3.0925,"actual_cpr":0.0,"n":29},{"period":202502,"pred_cpr":3.4043,"actual_cpr":0.0,"n":30},{"period":202503,"pred_cpr":3.3776,"actual_cpr":0.0,"n":30},{"period":202504,"pred_cpr":3.2305,"actual_cpr":0.0,"n":30},{"period":202505,"pred_cpr":2.9048,"actual_cpr":0.0,"n":32},{"period":202506,"pred_cpr":3.1987,"actual_cpr":0.0,"n":31},{"period":202507,"pred_cpr":3.0644,"actual_cpr":0.0,"n":31},{"period":202508,"pred_cpr":3.3461,"actual_cpr":0.0,"n":31},{"period":202509,"pred_cpr":3.6687,"actual_cpr":0.0,"n":31},{"period":202510,"pred_cpr":3.8126,"actual_cpr":0.0,"n":31},{"period":202511,"pred_cpr":4.0206,"actual_cpr":0.0,"n":31},{"period":202512,"pred_cpr":3.9873,"actual_cpr":0.0,"n":31},{"period":202601,"pred_cpr":4.3426,"actual_cpr":0.0,"n":31},{"period":202602,"pred_cpr":4.7767,"actual_cpr":3.9013,"n":31},{"period":202603,"pred_cpr":3.9675,"actual_cpr":0.0,"n":30}],"221d4":[{"period":201812,"pred_cpr":6.4324,"actual_cpr":5.0757,"n":2341},{"period":201901,"pred_cpr":6.5808,"actual_cpr":0.9487,"n":2345},{"period":201902,"pred_cpr":6.4681,"actual_cpr":3.9251,"n":2352},{"period":201903,"pred_cpr":8.0303,"actual_cpr":2.8246,"n":2352},{"period":201904,"pred_cpr":8.6726,"actual_cpr":1.4962,"n":2366},{"period":201905,"pred_cpr":12.3784,"actual_cpr":1.8197,"n":2369},{"period":201906,"pred_cpr":12.7572,"actual_cpr":8.0349,"n":2384},{"period":201907,"pred_cpr":14.4584,"actual_cpr":8.5493,"n":2386},{"period":201908,"pred_cpr":20.1434,"actual_cpr":7.5145,"n":2382},{"period":201909,"pred_cpr":17.1614,"actual_cpr":15.2324,"n":2391},{"period":201910,"pred_cpr":17.5719,"actual_cpr":16.4507,"n":2391},{"period":201911,"pred_cpr":14.4769,"actual_cpr":11.1432,"n":2391},{"period":201912,"pred_cpr":12.5794,"actual_cpr":16.9726,"n":2406},{"period":202001,"pred_cpr":19.0566,"actual_cpr":17.2341,"n":2400},{"period":202002,"pred_cpr":23.5047,"actual_cpr":25.2725,"n":2400},{"period":202003,"pred_cpr":23.7262,"actual_cpr":30.0796,"n":2392},{"period":202004,"pred_cpr":27.5594,"actual_cpr":29.6652,"n":2405},{"period":202005,"pred_cpr":28.9544,"actual_cpr":23.9877,"n":2399},{"period":202006,"pred_cpr":30.0119,"actual_cpr":20.2607,"n":2402},{"period":202007,"pred_cpr":35.5741,"actual_cpr":31.0833,"n":2433},{"period":202008,"pred_cpr":37.1038,"actual_cpr":28.1645,"n":2421},{"period":202009,"pred_cpr":37.1205,"actual_cpr":37.7437,"n":2417},{"period":202010,"pred_cpr":29.944,"actual_cpr":30.3189,"n":2402},{"period":202011,"pred_cpr":31.4227,"actual_cpr":34.5916,"n":2393},{"period":202012,"pred_cpr":32.4263,"actual_cpr":49.4001,"n":2391},{"period":202101,"pred_cpr":30.7137,"actual_cpr":41.7079,"n":2357},{"period":202102,"pred_cpr":25.5354,"actual_cpr":50.2079,"n":2348},{"period":202103,"pred_cpr":20.1729,"actual_cpr":33.3071,"n":2338},{"period":202104,"pred_cpr":22.3664,"actual_cpr":44.5236,"n":2327},{"period":202105,"pred_cpr":25.6459,"actual_cpr":41.2247,"n":2304},{"period":202106,"pred_cpr":28.2615,"actual_cpr":39.2183,"n":2284},{"period":202107,"pred_cpr":31.6097,"actual_cpr":39.1554,"n":2275},{"period":202108,"pred_cpr":28.882,"actual_cpr":32.001,"n":2263},{"period":202109,"pred_cpr":27.0724,"actual_cpr":43.5311,"n":2260},{"period":202110,"pred_cpr":26.1354,"actual_cpr":42.8397,"n":2248},{"period":202111,"pred_cpr":25.0945,"actual_cpr":42.9913,"n":2257},{"period":202112,"pred_cpr":22.4295,"actual_cpr":52.4787,"n":2248},{"period":202201,"pred_cpr":17.7896,"actual_cpr":26.0049,"n":2204},{"period":202202,"pred_cpr":14.1583,"actual_cpr":15.7727,"n":2210},{"period":202203,"pred_cpr":9.4055,"actual_cpr":18.634,"n":2233},{"period":202204,"pred_cpr":5.8032,"actual_cpr":12.428,"n":2235},{"period":202205,"pred_cpr":10.2168,"actual_cpr":18.3954,"n":2242},{"period":202206,"pred_cpr":8.4504,"actual_cpr":10.9571,"n":2247},{"period":202207,"pred_cpr":10.0829,"actual_cpr":2.8426,"n":2239},{"period":202208,"pred_cpr":7.3482,"actual_cpr":4.5648,"n":2246},{"period":202209,"pred_cpr":5.1503,"actual_cpr":25.4619,"n":2248},{"period":202210,"pred_cpr":4.1879,"actual_cpr":3.7328,"n":2216},{"period":202211,"pred_cpr":5.3519,"actual_cpr":1.8572,"n":2232},{"period":202212,"pred_cpr":5.0171,"actual_cpr":3.9152,"n":2252},{"period":202301,"pred_cpr":6.0155,"actual_cpr":1.5768,"n":2260},{"period":202302,"pred_cpr":5.3263,"actual_cpr":2.5205,"n":2277},{"period":202303,"pred_cpr":5.3821,"actual_cpr":1.8648,"n":2291},{"period":202304,"pred_cpr":5.1829,"actual_cpr":0.6783,"n":2297},{"period":202305,"pred_cpr":4.5775,"actual_cpr":1.063,"n":2315},{"period":202306,"pred_cpr":4.4506,"actual_cpr":0.3195,"n":2329},{"period":202307,"pred_cpr":4.2202,"actual_cpr":0.5284,"n":2347},{"period":202308,"pred_cpr":3.9373,"actual_cpr":1.1551,"n":2356},{"period":202309,"pred_cpr":3.1988,"actual_cpr":2.5912,"n":2371},{"period":202310,"pred_cpr":2.6533,"actual_cpr":1.2418,"n":2383},{"period":202311,"pred_cpr":3.5806,"actual_cpr":1.1299,"n":2399},{"period":202312,"pred_cpr":4.6442,"actual_cpr":2.2625,"n":2399},{"period":202401,"pred_cpr":4.6355,"actual_cpr":0.0729,"n":2401},{"period":202402,"pred_cpr":4.2355,"actual_cpr":1.5675,"n":2412},{"period":202403,"pred_cpr":4.342,"actual_cpr":0.3318,"n":2420},{"period":202404,"pred_cpr":3.5406,"actual_cpr":0.2682,"n":2429},{"period":202405,"pred_cpr":3.9163,"actual_cpr":0.0617,"n":2440},{"period":202406,"pred_cpr":4.1347,"actual_cpr":1.1188,"n":2456},{"period":202407,"pred_cpr":4.7676,"actual_cpr":0.0431,"n":2468},{"period":202408,"pred_cpr":5.0292,"actual_cpr":0.1049,"n":2480},{"period":202409,"pred_cpr":5.5732,"actual_cpr":0.0923,"n":2489},{"period":202410,"pred_cpr":4.4853,"actual_cpr":1.1719,"n":2506},{"period":202411,"pred_cpr":4.8489,"actual_cpr":0.2663,"n":2517},{"period":202412,"pred_cpr":4.1907,"actual_cpr":0.6355,"n":2538},{"period":202501,"pred_cpr":4.2094,"actual_cpr":0.0634,"n":2545},{"period":202502,"pred_cpr":4.7344,"actual_cpr":0.8946,"n":2548},{"period":202503,"pred_cpr":4.6694,"actual_cpr":1.6017,"n":2555},{"period":202504,"pred_cpr":4.4621,"actual_cpr":0.4595,"n":2561},{"period":202505,"pred_cpr":4.0819,"actual_cpr":0.0221,"n":2573},{"period":202506,"pred_cpr":4.5034,"actual_cpr":0.9442,"n":2586},{"period":202507,"pred_cpr":4.3253,"actual_cpr":7.5392,"n":2593},{"period":202508,"pred_cpr":4.7188,"actual_cpr":0.2723,"n":2600},{"period":202509,"pred_cpr":5.1116,"actual_cpr":0.0,"n":2615},{"period":202510,"pred_cpr":5.3335,"actual_cpr":0.7418,"n":2620},{"period":202511,"pred_cpr":5.7796,"actual_cpr":0.1859,"n":2630},{"period":202512,"pred_cpr":5.7358,"actual_cpr":1.6646,"n":2636},{"period":202601,"pred_cpr":6.266,"actual_cpr":0.2518,"n":2631},{"period":202602,"pred_cpr":7.0035,"actual_cpr":0.7033,"n":2634},{"period":202603,"pred_cpr":5.6405,"actual_cpr":0.0,"n":2635}],"223a7":[{"period":201812,"pred_cpr":5.3085,"actual_cpr":3.4851,"n":1861},{"period":201901,"pred_cpr":5.4268,"actual_cpr":0.7776,"n":1851},{"period":201902,"pred_cpr":5.3728,"actual_cpr":11.63,"n":1848},{"period":201903,"pred_cpr":6.4735,"actual_cpr":6.9175,"n":1833},{"period":201904,"pred_cpr":7.0033,"actual_cpr":6.3926,"n":1825},{"period":201905,"pred_cpr":9.79,"actual_cpr":2.6245,"n":1814},{"period":201906,"pred_cpr":10.1816,"actual_cpr":3.3235,"n":1801},{"period":201907,"pred_cpr":11.4601,"actual_cpr":15.5974,"n":1792},{"period":201908,"pred_cpr":15.7651,"actual_cpr":8.824,"n":1773},{"period":201909,"pred_cpr":13.6325,"actual_cpr":12.0048,"n":1762},{"period":201910,"pred_cpr":14.051,"actual_cpr":6.127,"n":1751},{"period":201911,"pred_cpr":11.8325,"actual_cpr":4.6331,"n":1744},{"period":201912,"pred_cpr":10.4798,"actual_cpr":9.9197,"n":1740},{"period":202001,"pred_cpr":15.7582,"actual_cpr":7.6581,"n":1719},{"period":202002,"pred_cpr":19.2963,"actual_cpr":22.8121,"n":1712},{"period":202003,"pred_cpr":19.6271,"actual_cpr":12.2039,"n":1700},{"period":202004,"pred_cpr":22.7166,"actual_cpr":12.5038,"n":1700},{"period":202005,"pred_cpr":23.9668,"actual_cpr":15.7168,"n":1692},{"period":202006,"pred_cpr":24.6997,"actual_cpr":21.9852,"n":1681},{"period":202007,"pred_cpr":28.5979,"actual_cpr":24.297,"n":1668},{"period":202008,"pred_cpr":29.3306,"actual_cpr":26.4596,"n":1656},{"period":202009,"pred_cpr":28.4338,"actual_cpr":37.2295,"n":1666},{"period":202010,"pred_cpr":22.637,"actual_cpr":33.4016,"n":1664},{"period":202011,"pred_cpr":23.2355,"actual_cpr":22.7724,"n":1662},{"period":202012,"pred_cpr":22.9263,"actual_cpr":37.6919,"n":1658},{"period":202101,"pred_cpr":21.127,"actual_cpr":26.9342,"n":1664},{"period":202102,"pred_cpr":17.501,"actual_cpr":30.677,"n":1668},{"period":202103,"pred_cpr":14.0996,"actual_cpr":46.4525,"n":1672},{"period":202104,"pred_cpr":13.5849,"actual_cpr":12.1713,"n":1671},{"period":202105,"pred_cpr":15.0278,"actual_cpr":13.6829,"n":1682},{"period":202106,"pred_cpr":16.0378,"actual_cpr":13.8208,"n":1688},{"period":202107,"pred_cpr":17.468,"actual_cpr":12.7416,"n":1686},{"period":202108,"pred_cpr":16.1105,"actual_cpr":12.9229,"n":1671},{"period":202109,"pred_cpr":15.0035,"actual_cpr":29.0651,"n":1663},{"period":202110,"pred_cpr":14.3816,"actual_cpr":24.8446,"n":1656},{"period":202111,"pred_cpr":14.1507,"actual_cpr":29.5427,"n":1646},{"period":202112,"pred_cpr":12.6708,"actual_cpr":17.9899,"n":1633},{"period":202201,"pred_cpr":10.6553,"actual_cpr":12.0511,"n":1612},{"period":202202,"pred_cpr":8.8322,"actual_cpr":17.3419,"n":1612},{"period":202203,"pred_cpr":6.1492,"actual_cpr":10.2656,"n":1601},{"period":202204,"pred_cpr":3.9738,"actual_cpr":7.8425,"n":1589},{"period":202205,"pred_cpr":7.081,"actual_cpr":5.9492,"n":1583},{"period":202206,"pred_cpr":5.9061,"actual_cpr":7.7826,"n":1579},{"period":202207,"pred_cpr":6.982,"actual_cpr":4.8543,"n":1570},{"period":202208,"pred_cpr":5.1871,"actual_cpr":9.2231,"n":1556},{"period":202209,"pred_cpr":3.6748,"actual_cpr":9.2657,"n":1539},{"period":202210,"pred_cpr":3.0153,"actual_cpr":2.8515,"n":1528},{"period":202211,"pred_cpr":3.8515,"actual_cpr":2.0633,"n":1523},{"period":202212,"pred_cpr":3.6674,"actual_cpr":2.6312,"n":1517},{"period":202301,"pred_cpr":4.4097,"actual_cpr":1.9479,"n":1511},{"period":202302,"pred_cpr":3.9383,"actual_cpr":1.5257,"n":1508},{"period":202303,"pred_cpr":3.9963,"actual_cpr":1.46,"n":1499},{"period":202304,"pred_cpr":3.8658,"actual_cpr":0.3444,"n":1492},{"period":202305,"pred_cpr":3.435,"actual_cpr":2.1456,"n":1490},{"period":202306,"pred_cpr":3.352,"actual_cpr":0.334,"n":1483},{"period":202307,"pred_cpr":3.1713,"actual_cpr":1.5489,"n":1476},{"period":202308,"pred_cpr":2.9518,"actual_cpr":1.3566,"n":1474},{"period":202309,"pred_cpr":2.3836,"actual_cpr":0.2788,"n":1470},{"period":202310,"pred_cpr":1.9681,"actual_cpr":0.6584,"n":1469},{"period":202311,"pred_cpr":2.6677,"actual_cpr":0.588,"n":1464},{"period":202312,"pred_cpr":3.4898,"actual_cpr":2.8008,"n":1457},{"period":202401,"pred_cpr":3.4929,"actual_cpr":0.5938,"n":1449},{"period":202402,"pred_cpr":3.2063,"actual_cpr":1.6626,"n":1447},{"period":202403,"pred_cpr":3.2893,"actual_cpr":2.5778,"n":1442},{"period":202404,"pred_cpr":2.6651,"actual_cpr":0.2577,"n":1436},{"period":202405,"pred_cpr":2.9449,"actual_cpr":4.4086,"n":1431},{"period":202406,"pred_cpr":3.1126,"actual_cpr":2.0008,"n":1423},{"period":202407,"pred_cpr":3.6001,"actual_cpr":2.2663,"n":1416},{"period":202408,"pred_cpr":3.881,"actual_cpr":0.8958,"n":1412},{"period":202409,"pred_cpr":4.2722,"actual_cpr":1.5982,"n":1408},{"period":202410,"pred_cpr":3.4292,"actual_cpr":0.175,"n":1399},{"period":202411,"pred_cpr":3.7153,"actual_cpr":2.6368,"n":1396},{"period":202412,"pred_cpr":3.1938,"actual_cpr":2.9031,"n":1391},{"period":202501,"pred_cpr":3.2068,"actual_cpr":0.4848,"n":1377},{"period":202502,"pred_cpr":3.6242,"actual_cpr":0.0761,"n":1372},{"period":202503,"pred_cpr":3.5618,"actual_cpr":0.0021,"n":1368},{"period":202504,"pred_cpr":3.4389,"actual_cpr":1.2998,"n":1367},{"period":202505,"pred_cpr":3.1352,"actual_cpr":0.4958,"n":1361},{"period":202506,"pred_cpr":3.4521,"actual_cpr":0.2705,"n":1359},{"period":202507,"pred_cpr":3.3124,"actual_cpr":8.1826,"n":1357},{"period":202508,"pred_cpr":3.6141,"actual_cpr":0.118,"n":1345},{"period":202509,"pred_cpr":3.8581,"actual_cpr":1.6896,"n":1339},{"period":202510,"pred_cpr":4.022,"actual_cpr":0.0203,"n":1335},{"period":202511,"pred_cpr":4.2563,"actual_cpr":1.9749,"n":1335},{"period":202512,"pred_cpr":4.2213,"actual_cpr":0.2762,"n":1333},{"period":202601,"pred_cpr":4.5704,"actual_cpr":1.6701,"n":1330},{"period":202602,"pred_cpr":5.0171,"actual_cpr":0.3149,"n":1324},{"period":202603,"pred_cpr":4.1211,"actual_cpr":0.0,"n":1321}],"223f":[{"period":201812,"pred_cpr":4.7298,"actual_cpr":6.4061,"n":5120},{"period":201901,"pred_cpr":4.8485,"actual_cpr":1.9819,"n":5126},{"period":201902,"pred_cpr":4.8083,"actual_cpr":3.7434,"n":5146},{"period":201903,"pred_cpr":5.8317,"actual_cpr":3.2114,"n":5151},{"period":201904,"pred_cpr":6.2569,"actual_cpr":3.0263,"n":5176},{"period":201905,"pred_cpr":8.6703,"actual_cpr":2.6544,"n":5187},{"period":201906,"pred_cpr":8.9674,"actual_cpr":6.61,"n":5196},{"period":201907,"pred_cpr":10.0061,"actual_cpr":6.5893,"n":5209},{"period":201908,"pred_cpr":14.0594,"actual_cpr":3.547,"n":5213},{"period":201909,"pred_cpr":11.9853,"actual_cpr":4.4288,"n":5227},{"period":201910,"pred_cpr":12.4112,"actual_cpr":12.2466,"n":5231},{"period":201911,"pred_cpr":10.2493,"actual_cpr":5.377,"n":5245},{"period":201912,"pred_cpr":8.9796,"actual_cpr":9.9067,"n":5256},{"period":202001,"pred_cpr":13.6992,"actual_cpr":8.3069,"n":5255},{"period":202002,"pred_cpr":17.3434,"actual_cpr":13.3658,"n":5247},{"period":202003,"pred_cpr":17.593,"actual_cpr":11.8517,"n":5245},{"period":202004,"pred_cpr":21.0433,"actual_cpr":13.5846,"n":5250},{"period":202005,"pred_cpr":22.3646,"actual_cpr":28.7284,"n":5245},{"period":202006,"pred_cpr":23.2182,"actual_cpr":28.341,"n":5229},{"period":202007,"pred_cpr":27.7715,"actual_cpr":27.5134,"n":5218},{"period":202008,"pred_cpr":28.6437,"actual_cpr":23.9974,"n":5220},{"period":202009,"pred_cpr":28.3545,"actual_cpr":27.1096,"n":5195},{"period":202010,"pred_cpr":22.3864,"actual_cpr":31.4992,"n":5173},{"period":202011,"pred_cpr":23.3095,"actual_cpr":26.7466,"n":5127},{"period":202012,"pred_cpr":24.0018,"actual_cpr":42.9859,"n":5121},{"period":202101,"pred_cpr":22.2769,"actual_cpr":28.9188,"n":5070},{"period":202102,"pred_cpr":18.2088,"actual_cpr":35.1876,"n":5046},{"period":202103,"pred_cpr":14.2286,"actual_cpr":20.8449,"n":5039},{"period":202104,"pred_cpr":15.3682,"actual_cpr":27.1299,"n":5063},{"period":202105,"pred_cpr":17.2121,"actual_cpr":21.032,"n":5070},{"period":202106,"pred_cpr":18.7572,"actual_cpr":24.5033,"n":5054},{"period":202107,"pred_cpr":20.3732,"actual_cpr":17.4422,"n":5057},{"period":202108,"pred_cpr":18.2564,"actual_cpr":15.6561,"n":5058},{"period":202109,"pred_cpr":16.9283,"actual_cpr":22.5702,"n":5093},{"period":202110,"pred_cpr":16.1637,"actual_cpr":15.3202,"n":5088},{"period":202111,"pred_cpr":15.5555,"actual_cpr":23.3819,"n":5120},{"period":202112,"pred_cpr":14.0081,"actual_cpr":28.6617,"n":5139},{"period":202201,"pred_cpr":11.4249,"actual_cpr":10.44,"n":5100},{"period":202202,"pred_cpr":9.234,"actual_cpr":13.574,"n":5129},{"period":202203,"pred_cpr":6.1556,"actual_cpr":12.7629,"n":5144},{"period":202204,"pred_cpr":3.9365,"actual_cpr":20.4792,"n":5178},{"period":202205,"pred_cpr":6.5197,"actual_cpr":11.7484,"n":5213},{"period":202206,"pred_cpr":5.5041,"actual_cpr":9.2986,"n":5228},{"period":202207,"pred_cpr":6.5536,"actual_cpr":5.6149,"n":5252},{"period":202208,"pred_cpr":4.9513,"actual_cpr":9.5638,"n":5282},{"period":202209,"pred_cpr":3.5482,"actual_cpr":5.5135,"n":5309},{"period":202210,"pred_cpr":2.94,"actual_cpr":2.5974,"n":5331},{"period":202211,"pred_cpr":3.7881,"actual_cpr":5.0916,"n":5373},{"period":202212,"pred_cpr":3.6089,"actual_cpr":3.5792,"n":5398},{"period":202301,"pred_cpr":4.3823,"actual_cpr":1.7997,"n":5405},{"period":202302,"pred_cpr":3.982,"actual_cpr":1.1358,"n":5422},{"period":202303,"pred_cpr":4.1006,"actual_cpr":1.3345,"n":5443},{"period":202304,"pred_cpr":4.0059,"actual_cpr":1.2672,"n":5459},{"period":202305,"pred_cpr":3.5734,"actual_cpr":1.4486,"n":5478},{"period":202306,"pred_cpr":3.5028,"actual_cpr":1.9023,"n":5484},{"period":202307,"pred_cpr":3.3213,"actual_cpr":1.0849,"n":5480},{"period":202308,"pred_cpr":3.121,"actual_cpr":1.6315,"n":5487},{"period":202309,"pred_cpr":2.5147,"actual_cpr":2.5925,"n":5492},{"period":202310,"pred_cpr":2.0872,"actual_cpr":0.433,"n":5503},{"period":202311,"pred_cpr":2.8935,"actual_cpr":0.8054,"n":5509},{"period":202312,"pred_cpr":3.9455,"actual_cpr":1.4839,"n":5506},{"period":202401,"pred_cpr":3.9668,"actual_cpr":1.9608,"n":5508},{"period":202402,"pred_cpr":3.6081,"actual_cpr":0.6259,"n":5512},{"period":202403,"pred_cpr":3.6954,"actual_cpr":2.4852,"n":5520},{"period":202404,"pred_cpr":2.9534,"actual_cpr":0.2621,"n":5513},{"period":202405,"pred_cpr":3.3236,"actual_cpr":0.8159,"n":5518},{"period":202406,"pred_cpr":3.5786,"actual_cpr":0.7408,"n":5521},{"period":202407,"pred_cpr":4.2207,"actual_cpr":0.6103,"n":5513},{"period":202408,"pred_cpr":4.5459,"actual_cpr":0.6132,"n":5524},{"period":202409,"pred_cpr":5.1465,"actual_cpr":0.5042,"n":5531},{"period":202410,"pred_cpr":4.0201,"actual_cpr":0.9547,"n":5545},{"period":202411,"pred_cpr":4.4225,"actual_cpr":2.336,"n":5553},{"period":202412,"pred_cpr":3.757,"actual_cpr":0.6996,"n":5551},{"period":202501,"pred_cpr":3.785,"actual_cpr":1.6229,"n":5547},{"period":202502,"pred_cpr":4.3583,"actual_cpr":1.3499,"n":5551},{"period":202503,"pred_cpr":4.2901,"actual_cpr":1.6818,"n":5556},{"period":202504,"pred_cpr":4.0592,"actual_cpr":1.486,"n":5567},{"period":202505,"pred_cpr":3.6693,"actual_cpr":0.8965,"n":5574},{"period":202506,"pred_cpr":4.0956,"actual_cpr":1.6251,"n":5581},{"period":202507,"pred_cpr":3.9124,"actual_cpr":1.8531,"n":5585},{"period":202508,"pred_cpr":4.3649,"actual_cpr":2.135,"n":5595},{"period":202509,"pred_cpr":4.7395,"actual_cpr":0.4406,"n":5602},{"period":202510,"pred_cpr":5.0109,"actual_cpr":1.4169,"n":5630},{"period":202511,"pred_cpr":5.3557,"actual_cpr":0.6582,"n":5643},{"period":202512,"pred_cpr":5.2965,"actual_cpr":3.1702,"n":5673},{"period":202601,"pred_cpr":5.8794,"actual_cpr":1.2054,"n":5660},{"period":202602,"pred_cpr":6.6775,"actual_cpr":1.5835,"n":5666},{"period":202603,"pred_cpr":5.1627,"actual_cpr":0.0,"n":5666}],"232":[{"period":201812,"pred_cpr":4.1802,"actual_cpr":4.3102,"n":3400},{"period":201901,"pred_cpr":4.2928,"actual_cpr":0.642,"n":3391},{"period":201902,"pred_cpr":4.2489,"actual_cpr":4.1741,"n":3411},{"period":201903,"pred_cpr":5.2595,"actual_cpr":4.6587,"n":3406},{"period":201904,"pred_cpr":5.7134,"actual_cpr":2.4196,"n":3416},{"period":201905,"pred_cpr":8.0962,"actual_cpr":2.1232,"n":3423},{"period":201906,"pred_cpr":8.4213,"actual_cpr":3.5227,"n":3428},{"period":201907,"pred_cpr":9.4341,"actual_cpr":2.3337,"n":3438},{"period":201908,"pred_cpr":13.3486,"actual_cpr":4.1006,"n":3473},{"period":201909,"pred_cpr":11.3895,"actual_cpr":3.5139,"n":3495},{"period":201910,"pred_cpr":11.7684,"actual_cpr":10.6143,"n":3517},{"period":201911,"pred_cpr":9.7232,"actual_cpr":8.9528,"n":3517},{"period":201912,"pred_cpr":8.4256,"actual_cpr":6.7129,"n":3543},{"period":202001,"pred_cpr":12.8307,"actual_cpr":5.5052,"n":3555},{"period":202002,"pred_cpr":16.0008,"actual_cpr":13.4262,"n":3557},{"period":202003,"pred_cpr":16.2576,"actual_cpr":15.4872,"n":3561},{"period":202004,"pred_cpr":19.1173,"actual_cpr":19.1112,"n":3564},{"period":202005,"pred_cpr":20.0539,"actual_cpr":20.8606,"n":3579},{"period":202006,"pred_cpr":20.6634,"actual_cpr":20.1648,"n":3600},{"period":202007,"pred_cpr":24.4079,"actual_cpr":25.0411,"n":3614},{"period":202008,"pred_cpr":25.0556,"actual_cpr":14.0974,"n":3630},{"period":202009,"pred_cpr":25.023,"actual_cpr":18.8902,"n":3630},{"period":202010,"pred_cpr":20.131,"actual_cpr":25.4819,"n":3633},{"period":202011,"pred_cpr":20.9293,"actual_cpr":29.1854,"n":3618},{"period":202012,"pred_cpr":21.5792,"actual_cpr":25.1269,"n":3600},{"period":202101,"pred_cpr":20.4771,"actual_cpr":20.9904,"n":3581},{"period":202102,"pred_cpr":17.0417,"actual_cpr":19.7596,"n":3599},{"period":202103,"pred_cpr":13.8194,"actual_cpr":20.4089,"n":3613},{"period":202104,"pred_cpr":15.0679,"actual_cpr":23.3551,"n":3609},{"period":202105,"pred_cpr":16.9343,"actual_cpr":14.2016,"n":3597},{"period":202106,"pred_cpr":18.5855,"actual_cpr":11.3714,"n":3589},{"period":202107,"pred_cpr":20.7281,"actual_cpr":12.7541,"n":3568},{"period":202108,"pred_cpr":18.9645,"actual_cpr":25.2951,"n":3570},{"period":202109,"pred_cpr":17.4837,"actual_cpr":22.4179,"n":3574},{"period":202110,"pred_cpr":16.7587,"actual_cpr":22.1918,"n":3576},{"period":202111,"pred_cpr":16.2767,"actual_cpr":25.6458,"n":3568},{"period":202112,"pred_cpr":14.7441,"actual_cpr":22.8246,"n":3569},{"period":202201,"pred_cpr":12.0101,"actual_cpr":9.3153,"n":3544},{"period":202202,"pred_cpr":9.7016,"actual_cpr":13.6649,"n":3582},{"period":202203,"pred_cpr":6.3935,"actual_cpr":8.3586,"n":3589},{"period":202204,"pred_cpr":3.9749,"actual_cpr":6.0196,"n":3576},{"period":202205,"pred_cpr":7.7807,"actual_cpr":15.8327,"n":3582},{"period":202206,"pred_cpr":6.4396,"actual_cpr":9.7691,"n":3546},{"period":202207,"pred_cpr":7.705,"actual_cpr":6.553,"n":3535},{"period":202208,"pred_cpr":5.6176,"actual_cpr":4.0492,"n":3526},{"period":202209,"pred_cpr":3.9008,"actual_cpr":6.7139,"n":3508},{"period":202210,"pred_cpr":3.2063,"actual_cpr":10.1927,"n":3515},{"period":202211,"pred_cpr":4.148,"actual_cpr":2.1526,"n":3494},{"period":202212,"pred_cpr":3.9206,"actual_cpr":2.4098,"n":3498},{"period":202301,"pred_cpr":4.8321,"actual_cpr":0.7945,"n":3507},{"period":202302,"pred_cpr":4.2835,"actual_cpr":0.8098,"n":3513},{"period":202303,"pred_cpr":4.4073,"actual_cpr":7.6085,"n":3518},{"period":202304,"pred_cpr":4.2611,"actual_cpr":1.6555,"n":3501},{"period":202305,"pred_cpr":3.8002,"actual_cpr":0.2009,"n":3505},{"period":202306,"pred_cpr":3.7125,"actual_cpr":3.3082,"n":3518},{"period":202307,"pred_cpr":3.5524,"actual_cpr":1.5784,"n":3515},{"period":202308,"pred_cpr":3.3501,"actual_cpr":4.8044,"n":3526},{"period":202309,"pred_cpr":2.7019,"actual_cpr":1.8163,"n":3518},{"period":202310,"pred_cpr":2.2653,"actual_cpr":1.3978,"n":3530},{"period":202311,"pred_cpr":3.1624,"actual_cpr":8.5005,"n":3531},{"period":202312,"pred_cpr":4.4416,"actual_cpr":0.7918,"n":3529},{"period":202401,"pred_cpr":4.4984,"actual_cpr":1.6106,"n":3535},{"period":202402,"pred_cpr":4.0467,"actual_cpr":0.2754,"n":3537},{"period":202403,"pred_cpr":4.1944,"actual_cpr":4.0469,"n":3554},{"period":202404,"pred_cpr":3.249,"actual_cpr":1.8584,"n":3544},{"period":202405,"pred_cpr":3.6899,"actual_cpr":0.5678,"n":3551},{"period":202406,"pred_cpr":4.011,"actual_cpr":1.3207,"n":3569},{"period":202407,"pred_cpr":4.8976,"actual_cpr":1.7455,"n":3574},{"period":202408,"pred_cpr":5.3524,"actual_cpr":2.312,"n":3588},{"period":202409,"pred_cpr":6.2754,"actual_cpr":0.9886,"n":3610},{"period":202410,"pred_cpr":4.6397,"actual_cpr":4.4915,"n":3621},{"period":202411,"pred_cpr":5.163,"actual_cpr":2.3211,"n":3631},{"period":202412,"pred_cpr":4.2264,"actual_cpr":1.9793,"n":3647},{"period":202501,"pred_cpr":4.2725,"actual_cpr":0.0,"n":3651},{"period":202502,"pred_cpr":5.0276,"actual_cpr":3.9124,"n":3672},{"period":202503,"pred_cpr":4.9236,"actual_cpr":3.0554,"n":3682},{"period":202504,"pred_cpr":4.5993,"actual_cpr":3.5086,"n":3693},{"period":202505,"pred_cpr":4.0846,"actual_cpr":3.8959,"n":3694},{"period":202506,"pred_cpr":4.6305,"actual_cpr":4.8457,"n":3713},{"period":202507,"pred_cpr":4.3559,"actual_cpr":2.5939,"n":3726},{"period":202508,"pred_cpr":4.917,"actual_cpr":0.9026,"n":3738},{"period":202509,"pred_cpr":5.4077,"actual_cpr":1.7716,"n":3774},{"period":202510,"pred_cpr":5.7298,"actual_cpr":7.4071,"n":3798},{"period":202511,"pred_cpr":6.231,"actual_cpr":2.0404,"n":3809},{"period":202512,"pred_cpr":6.1113,"actual_cpr":11.4146,"n":3843},{"period":202601,"pred_cpr":6.9681,"actual_cpr":2.5486,"n":3836},{"period":202602,"pred_cpr":8.2056,"actual_cpr":1.3515,"n":3826},{"period":202603,"pred_cpr":5.8289,"actual_cpr":0.0,"n":3835}],"241":[{"period":201812,"pred_cpr":6.7044,"actual_cpr":18.8552,"n":76},{"period":201901,"pred_cpr":6.9771,"actual_cpr":0.0,"n":74},{"period":201902,"pred_cpr":6.8185,"actual_cpr":0.0,"n":75},{"period":201903,"pred_cpr":8.6532,"actual_cpr":12.7755,"n":75},{"period":201904,"pred_cpr":9.5059,"actual_cpr":65.969,"n":74},{"period":201905,"pred_cpr":13.3481,"actual_cpr":0.0,"n":74},{"period":201906,"pred_cpr":13.8992,"actual_cpr":14.6872,"n":77},{"period":201907,"pred_cpr":15.3346,"actual_cpr":0.0,"n":76},{"period":201908,"pred_cpr":20.3964,"actual_cpr":11.1083,"n":78},{"period":201909,"pred_cpr":18.0145,"actual_cpr":0.0,"n":74},{"period":201910,"pred_cpr":18.4956,"actual_cpr":12.1293,"n":75},{"period":201911,"pred_cpr":15.9606,"actual_cpr":20.3699,"n":75},{"period":201912,"pred_cpr":14.0948,"actual_cpr":14.835,"n":76},{"period":202001,"pred_cpr":20.531,"actual_cpr":0.0,"n":77},{"period":202002,"pred_cpr":25.0926,"actual_cpr":0.0,"n":79},{"period":202003,"pred_cpr":25.8639,"actual_cpr":31.6194,"n":80},{"period":202004,"pred_cpr":29.323,"actual_cpr":0.0,"n":82},{"period":202005,"pred_cpr":31.4664,"actual_cpr":0.0,"n":85},{"period":202006,"pred_cpr":32.2489,"actual_cpr":0.0,"n":87},{"period":202007,"pred_cpr":39.7556,"actual_cpr":0.0,"n":88},{"period":202008,"pred_cpr":41.4586,"actual_cpr":13.7561,"n":89},{"period":202009,"pred_cpr":41.8431,"actual_cpr":13.0496,"n":89},{"period":202010,"pred_cpr":36.0538,"actual_cpr":12.8615,"n":89},{"period":202011,"pred_cpr":38.2434,"actual_cpr":47.0343,"n":90},{"period":202012,"pred_cpr":38.9459,"actual_cpr":65.1919,"n":88},{"period":202101,"pred_cpr":36.7122,"actual_cpr":18.817,"n":85},{"period":202102,"pred_cpr":32.4833,"actual_cpr":98.5851,"n":84},{"period":202103,"pred_cpr":31.1866,"actual_cpr":42.7106,"n":86},{"period":202104,"pred_cpr":33.4218,"actual_cpr":81.4909,"n":86},{"period":202105,"pred_cpr":35.962,"actual_cpr":45.5547,"n":85},{"period":202106,"pred_cpr":38.3921,"actual_cpr":46.9356,"n":82},{"period":202107,"pred_cpr":39.7977,"actual_cpr":38.0436,"n":82},{"period":202108,"pred_cpr":37.2149,"actual_cpr":42.4612,"n":81},{"period":202109,"pred_cpr":35.9809,"actual_cpr":13.4134,"n":79},{"period":202110,"pred_cpr":34.9582,"actual_cpr":0.9275,"n":79},{"period":202111,"pred_cpr":34.2157,"actual_cpr":52.5496,"n":78},{"period":202112,"pred_cpr":30.1859,"actual_cpr":64.3083,"n":77},{"period":202201,"pred_cpr":23.9752,"actual_cpr":92.6857,"n":78},{"period":202202,"pred_cpr":16.603,"actual_cpr":8.0851,"n":72},{"period":202203,"pred_cpr":14.8583,"actual_cpr":71.8358,"n":72},{"period":202204,"pred_cpr":10.2942,"actual_cpr":30.7988,"n":73},{"period":202205,"pred_cpr":18.437,"actual_cpr":45.7354,"n":74},{"period":202206,"pred_cpr":12.7434,"actual_cpr":79.2389,"n":75},{"period":202207,"pred_cpr":17.2898,"actual_cpr":0.0,"n":73},{"period":202208,"pred_cpr":10.8042,"actual_cpr":0.0,"n":74},{"period":202209,"pred_cpr":6.2818,"actual_cpr":0.0,"n":78},{"period":202210,"pred_cpr":4.9928,"actual_cpr":0.0,"n":78},{"period":202211,"pred_cpr":6.9602,"actual_cpr":0.0,"n":78},{"period":202212,"pred_cpr":6.3033,"actual_cpr":3.0775,"n":78},{"period":202301,"pred_cpr":8.4207,"actual_cpr":0.0,"n":78},{"period":202302,"pred_cpr":7.575,"actual_cpr":0.0,"n":80},{"period":202303,"pred_cpr":7.6513,"actual_cpr":0.0,"n":81},{"period":202304,"pred_cpr":7.0866,"actual_cpr":0.0,"n":82},{"period":202305,"pred_cpr":5.9008,"actual_cpr":0.0,"n":83},{"period":202306,"pred_cpr":5.63,"actual_cpr":4.3341,"n":84},{"period":202307,"pred_cpr":5.2193,"actual_cpr":0.0,"n":84},{"period":202308,"pred_cpr":11.3315,"actual_cpr":0.0,"n":87},{"period":202309,"pred_cpr":8.1776,"actual_cpr":0.0,"n":87},{"period":202310,"pred_cpr":8.5766,"actual_cpr":99.152,"n":89},{"period":202311,"pred_cpr":9.3365,"actual_cpr":0.0,"n":90},{"period":202312,"pred_cpr":12.8424,"actual_cpr":0.0,"n":92},{"period":202401,"pred_cpr":12.5959,"actual_cpr":0.0,"n":92},{"period":202402,"pred_cpr":11.3553,"actual_cpr":0.0,"n":94},{"period":202403,"pred_cpr":11.5014,"actual_cpr":0.0,"n":95},{"period":202404,"pred_cpr":8.6247,"actual_cpr":0.0,"n":96},{"period":202405,"pred_cpr":9.6457,"actual_cpr":3.1505,"n":96},{"period":202406,"pred_cpr":10.2004,"actual_cpr":0.0,"n":94},{"period":202407,"pred_cpr":11.6983,"actual_cpr":0.0,"n":96},{"period":202408,"pred_cpr":12.1582,"actual_cpr":0.0,"n":98},{"period":202409,"pred_cpr":13.389,"actual_cpr":0.0,"n":98},{"period":202410,"pred_cpr":10.3812,"actual_cpr":0.0,"n":98},{"period":202411,"pred_cpr":11.1088,"actual_cpr":0.0,"n":98},{"period":202412,"pred_cpr":9.0169,"actual_cpr":0.0,"n":99},{"period":202501,"pred_cpr":8.8316,"actual_cpr":2.872,"n":100},{"period":202502,"pred_cpr":9.9775,"actual_cpr":0.0,"n":100},{"period":202503,"pred_cpr":9.6106,"actual_cpr":0.0,"n":100},{"period":202504,"pred_cpr":8.8624,"actual_cpr":0.0,"n":100},{"period":202505,"pred_cpr":7.6633,"actual_cpr":0.0,"n":100},{"period":202506,"pred_cpr":8.6181,"actual_cpr":3.328,"n":101},{"period":202507,"pred_cpr":7.9769,"actual_cpr":0.0,"n":101},{"period":202508,"pred_cpr":8.8977,"actual_cpr":0.0,"n":103},{"period":202509,"pred_cpr":9.536,"actual_cpr":4.0161,"n":103},{"period":202510,"pred_cpr":10.2985,"actual_cpr":96.8201,"n":105},{"period":202511,"pred_cpr":8.3659,"actual_cpr":0.0,"n":102},{"period":202512,"pred_cpr":8.1701,"actual_cpr":0.0,"n":102},{"period":202601,"pred_cpr":9.2731,"actual_cpr":0.0,"n":102},{"period":202602,"pred_cpr":10.7026,"actual_cpr":11.9793,"n":103},{"period":202603,"pred_cpr":8.5835,"actual_cpr":0.0,"n":103}],"538":[{"period":201812,"pred_cpr":2.5258,"actual_cpr":0.0,"n":590},{"period":201901,"pred_cpr":2.5711,"actual_cpr":1.8212,"n":595},{"period":201902,"pred_cpr":2.5195,"actual_cpr":2.502,"n":598},{"period":201903,"pred_cpr":3.1621,"actual_cpr":9.9567,"n":607},{"period":201904,"pred_cpr":3.4236,"actual_cpr":0.7211,"n":611},{"period":201905,"pred_cpr":4.8213,"actual_cpr":1.0013,"n":617},{"period":201906,"pred_cpr":4.9428,"actual_cpr":2.3189,"n":628},{"period":201907,"pred_cpr":6.0325,"actual_cpr":0.0,"n":655},{"period":201908,"pred_cpr":8.4123,"actual_cpr":0.0,"n":661},{"period":201909,"pred_cpr":7.1678,"actual_cpr":0.0,"n":666},{"period":201910,"pred_cpr":7.3985,"actual_cpr":0.0,"n":675},{"period":201911,"pred_cpr":6.1628,"actual_cpr":2.4394,"n":680},{"period":201912,"pred_cpr":5.3681,"actual_cpr":4.1757,"n":688},{"period":202001,"pred_cpr":8.1398,"actual_cpr":0.0,"n":692},{"period":202002,"pred_cpr":9.9235,"actual_cpr":4.9219,"n":693},{"period":202003,"pred_cpr":10.0828,"actual_cpr":0.9357,"n":695},{"period":202004,"pred_cpr":11.8077,"actual_cpr":7.2548,"n":758},{"period":202005,"pred_cpr":12.3884,"actual_cpr":0.8661,"n":762},{"period":202006,"pred_cpr":12.878,"actual_cpr":34.831,"n":777},{"period":202007,"pred_cpr":15.0059,"actual_cpr":26.4779,"n":782},{"period":202008,"pred_cpr":15.9356,"actual_cpr":13.3985,"n":793},{"period":202009,"pred_cpr":16.0164,"actual_cpr":20.9393,"n":799},{"period":202010,"pred_cpr":13.1775,"actual_cpr":38.3621,"n":808},{"period":202011,"pred_cpr":13.9012,"actual_cpr":12.9442,"n":816},{"period":202012,"pred_cpr":14.6841,"actual_cpr":8.0557,"n":823},{"period":202101,"pred_cpr":13.957,"actual_cpr":13.1817,"n":824},{"period":202102,"pred_cpr":12.2316,"actual_cpr":27.8664,"n":833},{"period":202103,"pred_cpr":10.2436,"actual_cpr":4.2879,"n":830},{"period":202104,"pred_cpr":11.3041,"actual_cpr":12.5076,"n":834},{"period":202105,"pred_cpr":12.8316,"actual_cpr":9.7139,"n":850},{"period":202106,"pred_cpr":14.0881,"actual_cpr":26.9365,"n":851},{"period":202107,"pred_cpr":15.5088,"actual_cpr":17.9194,"n":859},{"period":202108,"pred_cpr":14.2169,"actual_cpr":19.5864,"n":863},{"period":202109,"pred_cpr":13.2794,"actual_cpr":10.3523,"n":869},{"period":202110,"pred_cpr":12.6037,"actual_cpr":12.8493,"n":868},{"period":202111,"pred_cpr":12.1379,"actual_cpr":3.6494,"n":869},{"period":202112,"pred_cpr":11.2931,"actual_cpr":2.6507,"n":874},{"period":202201,"pred_cpr":9.5017,"actual_cpr":8.4135,"n":882},{"period":202202,"pred_cpr":7.755,"actual_cpr":11.1663,"n":885},{"period":202203,"pred_cpr":5.066,"actual_cpr":10.6076,"n":885},{"period":202204,"pred_cpr":2.8242,"actual_cpr":11.8653,"n":900},{"period":202205,"pred_cpr":2.8073,"actual_cpr":11.3378,"n":915},{"period":202206,"pred_cpr":2.1893,"actual_cpr":0.0,"n":922},{"period":202207,"pred_cpr":2.8176,"actual_cpr":1.2666,"n":932},{"period":202208,"pred_cpr":1.8276,"actual_cpr":3.0967,"n":942},{"period":202209,"pred_cpr":1.1084,"actual_cpr":1.612,"n":940},{"period":202210,"pred_cpr":0.8536,"actual_cpr":0.9114,"n":946},{"period":202211,"pred_cpr":1.2064,"actual_cpr":2.7855,"n":962},{"period":202212,"pred_cpr":1.1065,"actual_cpr":7.2242,"n":964},{"period":202301,"pred_cpr":1.4449,"actual_cpr":3.8694,"n":969},{"period":202302,"pred_cpr":1.212,"actual_cpr":2.5218,"n":976},{"period":202303,"pred_cpr":1.2212,"actual_cpr":5.9216,"n":985},{"period":202304,"pred_cpr":1.143,"actual_cpr":3.1965,"n":1011},{"period":202305,"pred_cpr":0.9595,"actual_cpr":1.6924,"n":1017},{"period":202306,"pred_cpr":0.92,"actual_cpr":9.2207,"n":1025},{"period":202307,"pred_cpr":0.8519,"actual_cpr":2.2649,"n":1039},{"period":202308,"pred_cpr":0.7742,"actual_cpr":1.877,"n":1044},{"period":202309,"pred_cpr":0.6005,"actual_cpr":0.6633,"n":1067},{"period":202310,"pred_cpr":0.4844,"actual_cpr":0.0,"n":1089},{"period":202311,"pred_cpr":0.6932,"actual_cpr":1.3236,"n":1102},{"period":202312,"pred_cpr":0.9778,"actual_cpr":0.0,"n":1110},{"period":202401,"pred_cpr":0.9683,"actual_cpr":0.0,"n":1121},{"period":202402,"pred_cpr":0.8547,"actual_cpr":0.0,"n":1127},{"period":202403,"pred_cpr":0.8841,"actual_cpr":0.7105,"n":1134},{"period":202404,"pred_cpr":0.6771,"actual_cpr":0.6904,"n":1140},{"period":202405,"pred_cpr":0.7659,"actual_cpr":1.0518,"n":1146},{"period":202406,"pred_cpr":0.8259,"actual_cpr":1.5627,"n":1155},{"period":202407,"pred_cpr":1.0525,"actual_cpr":3.059,"n":1160},{"period":202408,"pred_cpr":1.1406,"actual_cpr":2.5519,"n":1161},{"period":202409,"pred_cpr":1.3178,"actual_cpr":1.4219,"n":1163},{"period":202410,"pred_cpr":0.9652,"actual_cpr":6.1068,"n":1161},{"period":202411,"pred_cpr":1.0759,"actual_cpr":0.0,"n":1167},{"period":202412,"pred_cpr":0.8781,"actual_cpr":3.3493,"n":1169},{"period":202501,"pred_cpr":0.9176,"actual_cpr":0.0,"n":1178},{"period":202502,"pred_cpr":1.0714,"actual_cpr":0.5795,"n":1180},{"period":202503,"pred_cpr":1.0538,"actual_cpr":0.0,"n":1186},{"period":202504,"pred_cpr":0.9868,"actual_cpr":0.8687,"n":1188},{"period":202505,"pred_cpr":0.8765,"actual_cpr":0.0,"n":1189},{"period":202506,"pred_cpr":0.9896,"actual_cpr":0.0,"n":1195},{"period":202507,"pred_cpr":0.939,"actual_cpr":0.3779,"n":1197},{"period":202508,"pred_cpr":1.0689,"actual_cpr":1.307,"n":1200},{"period":202509,"pred_cpr":1.1763,"actual_cpr":0.0,"n":1201},{"period":202510,"pred_cpr":1.284,"actual_cpr":0.0,"n":1204},{"period":202511,"pred_cpr":1.3909,"actual_cpr":1.4794,"n":1204},{"period":202512,"pred_cpr":1.3795,"actual_cpr":2.1304,"n":1209},{"period":202601,"pred_cpr":1.6481,"actual_cpr":1.8355,"n":1215},{"period":202602,"pred_cpr":1.9322,"actual_cpr":0.6696,"n":1216},{"period":202603,"pred_cpr":1.4567,"actual_cpr":0.0,"n":1215}],"OTHER":[{"period":201812,"pred_cpr":6.5169,"actual_cpr":16.1107,"n":263},{"period":201901,"pred_cpr":6.5588,"actual_cpr":0.0464,"n":261},{"period":201902,"pred_cpr":6.3722,"actual_cpr":0.0,"n":261},{"period":201903,"pred_cpr":8.2333,"actual_cpr":0.0,"n":264},{"period":201904,"pred_cpr":8.8078,"actual_cpr":6.4437,"n":268},{"period":201905,"pred_cpr":11.7243,"actual_cpr":4.3355,"n":274},{"period":201906,"pred_cpr":12.1253,"actual_cpr":8.1044,"n":271},{"period":201907,"pred_cpr":13.7768,"actual_cpr":5.0735,"n":267},{"period":201908,"pred_cpr":18.5537,"actual_cpr":1.4296,"n":268},{"period":201909,"pred_cpr":16.2281,"actual_cpr":0.0,"n":268},{"period":201910,"pred_cpr":17.026,"actual_cpr":3.511,"n":272},{"period":201911,"pred_cpr":14.96,"actual_cpr":6.7834,"n":273},{"period":201912,"pred_cpr":12.971,"actual_cpr":14.0391,"n":277},{"period":202001,"pred_cpr":20.9182,"actual_cpr":3.3668,"n":277},{"period":202002,"pred_cpr":24.6631,"actual_cpr":24.7698,"n":281},{"period":202003,"pred_cpr":25.3575,"actual_cpr":1.2508,"n":285},{"period":202004,"pred_cpr":30.8167,"actual_cpr":0.0,"n":215},{"period":202005,"pred_cpr":31.9827,"actual_cpr":4.8975,"n":218},{"period":202006,"pred_cpr":32.7495,"actual_cpr":32.9489,"n":218},{"period":202007,"pred_cpr":37.9155,"actual_cpr":4.817,"n":208},{"period":202008,"pred_cpr":38.9108,"actual_cpr":9.6331,"n":209},{"period":202009,"pred_cpr":41.0741,"actual_cpr":72.4057,"n":210},{"period":202010,"pred_cpr":34.7092,"actual_cpr":43.4285,"n":203},{"period":202011,"pred_cpr":36.2841,"actual_cpr":25.5555,"n":197},{"period":202012,"pred_cpr":37.4808,"actual_cpr":72.5983,"n":193},{"period":202101,"pred_cpr":32.3405,"actual_cpr":9.2,"n":186},{"period":202102,"pred_cpr":30.941,"actual_cpr":77.4595,"n":187},{"period":202103,"pred_cpr":27.2236,"actual_cpr":70.7674,"n":182},{"period":202104,"pred_cpr":30.2734,"actual_cpr":59.081,"n":174},{"period":202105,"pred_cpr":33.9971,"actual_cpr":63.3507,"n":167},{"period":202106,"pred_cpr":36.8476,"actual_cpr":29.7824,"n":163},{"period":202107,"pred_cpr":41.903,"actual_cpr":43.5327,"n":161},{"period":202108,"pred_cpr":39.0129,"actual_cpr":4.2432,"n":159},{"period":202109,"pred_cpr":37.4838,"actual_cpr":49.2531,"n":158},{"period":202110,"pred_cpr":39.3891,"actual_cpr":28.8408,"n":157},{"period":202111,"pred_cpr":38.8822,"actual_cpr":74.2158,"n":156},{"period":202112,"pred_cpr":36.1166,"actual_cpr":59.2754,"n":150},{"period":202201,"pred_cpr":30.9201,"actual_cpr":63.9834,"n":144},{"period":202202,"pred_cpr":25.8802,"actual_cpr":30.4119,"n":144},{"period":202203,"pred_cpr":16.4335,"actual_cpr":52.6249,"n":145},{"period":202204,"pred_cpr":11.5945,"actual_cpr":0.0144,"n":143},{"period":202205,"pred_cpr":20.2445,"actual_cpr":64.3955,"n":143},{"period":202206,"pred_cpr":14.7809,"actual_cpr":30.1213,"n":142},{"period":202207,"pred_cpr":16.9333,"actual_cpr":21.5301,"n":141},{"period":202208,"pred_cpr":11.7473,"actual_cpr":1.0096,"n":140},{"period":202209,"pred_cpr":8.0195,"actual_cpr":0.0,"n":141},{"period":202210,"pred_cpr":6.546,"actual_cpr":0.0,"n":142},{"period":202211,"pred_cpr":8.4638,"actual_cpr":0.0,"n":142},{"period":202212,"pred_cpr":8.2022,"actual_cpr":0.0,"n":146},{"period":202301,"pred_cpr":9.7028,"actual_cpr":0.2976,"n":149},{"period":202302,"pred_cpr":8.5065,"actual_cpr":0.0,"n":149},{"period":202303,"pred_cpr":8.5341,"actual_cpr":0.0,"n":150},{"period":202304,"pred_cpr":8.1444,"actual_cpr":0.0,"n":149},{"period":202305,"pred_cpr":7.1854,"actual_cpr":2.5287,"n":150},{"period":202306,"pred_cpr":7.0344,"actual_cpr":32.3672,"n":150},{"period":202307,"pred_cpr":6.603,"actual_cpr":0.4299,"n":149},{"period":202308,"pred_cpr":6.1292,"actual_cpr":0.2391,"n":148},{"period":202309,"pred_cpr":4.9161,"actual_cpr":0.0,"n":148},{"period":202310,"pred_cpr":4.0464,"actual_cpr":0.0,"n":150},{"period":202311,"pred_cpr":5.5508,"actual_cpr":0.2149,"n":151},{"period":202312,"pred_cpr":7.2487,"actual_cpr":0.5702,"n":150},{"period":202401,"pred_cpr":7.2291,"actual_cpr":0.0,"n":149},{"period":202402,"pred_cpr":6.5742,"actual_cpr":0.0,"n":150},{"period":202403,"pred_cpr":6.7211,"actual_cpr":5.7428,"n":150},{"period":202404,"pred_cpr":5.4136,"actual_cpr":0.0044,"n":151},{"period":202405,"pred_cpr":5.9204,"actual_cpr":0.0,"n":149},{"period":202406,"pred_cpr":6.2505,"actual_cpr":3.6837,"n":151},{"period":202407,"pred_cpr":7.234,"actual_cpr":0.0,"n":149},{"period":202408,"pred_cpr":7.6261,"actual_cpr":0.0,"n":150},{"period":202409,"pred_cpr":8.3079,"actual_cpr":0.7605,"n":154},{"period":202410,"pred_cpr":6.6381,"actual_cpr":0.5441,"n":153},{"period":202411,"pred_cpr":7.1737,"actual_cpr":0.0,"n":153},{"period":202412,"pred_cpr":6.1273,"actual_cpr":23.9892,"n":154},{"period":202501,"pred_cpr":6.0666,"actual_cpr":7.7357,"n":156},{"period":202502,"pred_cpr":6.7854,"actual_cpr":0.0,"n":155},{"period":202503,"pred_cpr":6.7012,"actual_cpr":0.0,"n":156},{"period":202504,"pred_cpr":6.3988,"actual_cpr":0.0,"n":157},{"period":202505,"pred_cpr":5.9431,"actual_cpr":0.0,"n":160},{"period":202506,"pred_cpr":6.4704,"actual_cpr":0.0,"n":162},{"period":202507,"pred_cpr":6.1141,"actual_cpr":0.0,"n":163},{"period":202508,"pred_cpr":6.6372,"actual_cpr":0.0,"n":163},{"period":202509,"pred_cpr":7.0392,"actual_cpr":0.0,"n":164},{"period":202510,"pred_cpr":7.3107,"actual_cpr":0.0,"n":164},{"period":202511,"pred_cpr":7.7474,"actual_cpr":0.0,"n":164},{"period":202512,"pred_cpr":7.5065,"actual_cpr":0.0,"n":165},{"period":202601,"pred_cpr":8.4182,"actual_cpr":0.0,"n":166},{"period":202602,"pred_cpr":9.2992,"actual_cpr":0.0,"n":166},{"period":202603,"pred_cpr":7.5265,"actual_cpr":0.0,"n":166}]},"outliers":{"over_pred":[{"loan_id":"3618GKT46_000000003122165","period":202602,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":151.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25554262.27,"pred_cpr_pct":60.9984,"actual_cpr_pct":0.0,"residual":60.9984},{"loan_id":"3618FH2Q4_000000006122222","period":202602,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":27.0,"refi_incentive_bps":188.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21168268.24,"pred_cpr_pct":60.1704,"actual_cpr_pct":0.0,"residual":60.1704},{"loan_id":"36291QC51_000000007335665","period":202409,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":576.0,"refi_incentive_bps":114.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":355314.12,"pred_cpr_pct":58.6701,"actual_cpr_pct":0.0,"residual":58.6701},{"loan_id":"3618G8DV0_000000006622149","period":202602,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":27.0,"refi_incentive_bps":131.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43340779.43,"pred_cpr_pct":57.5354,"actual_cpr_pct":0.0,"residual":57.5354},{"loan_id":"36291QC51_000000007335665","period":202408,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":575.0,"refi_incentive_bps":94.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":359564.66,"pred_cpr_pct":54.8561,"actual_cpr_pct":0.0,"residual":54.8561},{"loan_id":"3618FH2Q4_000000006122222","period":202601,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":170.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21186240.17,"pred_cpr_pct":53.3403,"actual_cpr_pct":0.0,"residual":53.3403},{"loan_id":"3618GKT46_000000003122165","period":202601,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":133.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25577714.46,"pred_cpr_pct":53.2682,"actual_cpr_pct":0.0,"residual":53.2682},{"loan_id":"36291QC51_000000007335665","period":202411,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":578.0,"refi_incentive_bps":83.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":346750.77,"pred_cpr_pct":52.377,"actual_cpr_pct":0.0,"residual":52.377},{"loan_id":"36291QC51_000000007335665","period":202407,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":574.0,"refi_incentive_bps":83.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":363794.58,"pred_cpr_pct":51.7859,"actual_cpr_pct":0.0,"residual":51.7859},{"loan_id":"3618GDUT5_000000007110030","period":202602,"pool_cusip":"3618GDUT5","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":215.5,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":12571671.66,"pred_cpr_pct":51.7388,"actual_cpr_pct":0.0,"residual":51.7388},{"loan_id":"3618FTCW4_000000012622232","period":202602,"pool_cusip":"3618FTCW4","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":30.0,"refi_incentive_bps":138.5,"prepay_penalty_points":10.0,"sato_bps":164.5,"upb":17435188.93,"pred_cpr_pct":50.6369,"actual_cpr_pct":0.0,"residual":50.6369},{"loan_id":"3618FH2Q4_000000006122222","period":202409,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":10.0,"refi_incentive_bps":177.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21442419.61,"pred_cpr_pct":50.5265,"actual_cpr_pct":0.0,"residual":50.5265},{"loan_id":"36291QC51_000000007335665","period":202502,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":581.0,"refi_incentive_bps":74.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":333748.56,"pred_cpr_pct":50.4566,"actual_cpr_pct":0.0,"residual":50.4566},{"loan_id":"3618GKT46_000000003122165","period":202409,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":8.0,"refi_incentive_bps":127.5,"prepay_penalty_points":10.0,"sato_bps":145.0,"upb":25934408.06,"pred_cpr_pct":50.3966,"actual_cpr_pct":0.0,"residual":50.3966},{"loan_id":"3618FH2L5_000000001222462","period":202602,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":201.0,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67691219.55,"pred_cpr_pct":49.5119,"actual_cpr_pct":0.0,"residual":49.5119},{"loan_id":"3618G8DV0_000000006622149","period":202601,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":113.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43368064.19,"pred_cpr_pct":49.3369,"actual_cpr_pct":0.0,"residual":49.3369},{"loan_id":"36291QC51_000000007335665","period":202503,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":582.0,"refi_incentive_bps":69.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":329372.16,"pred_cpr_pct":49.305,"actual_cpr_pct":0.0,"residual":49.305},{"loan_id":"3618FH2Q4_000000006122222","period":202511,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":158.0,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21221839.68,"pred_cpr_pct":48.2933,"actual_cpr_pct":0.0,"residual":48.2933},{"loan_id":"36291QC51_000000007335665","period":202410,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":577.0,"refi_incentive_bps":67.0,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":351042.86,"pred_cpr_pct":47.9449,"actual_cpr_pct":0.0,"residual":47.9449},{"loan_id":"3618AWG24_000000005310040","period":202602,"pool_cusip":"3618AWG24","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"241","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":105.5,"prepay_penalty_points":10.0,"sato_bps":131.5,"upb":15104704.59,"pred_cpr_pct":47.7536,"actual_cpr_pct":0.0,"residual":47.7536},{"loan_id":"3618GKT46_000000003122165","period":202511,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":22.0,"refi_incentive_bps":120.5,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25624198.33,"pred_cpr_pct":47.5601,"actual_cpr_pct":0.0,"residual":47.5601},{"loan_id":"3618FH2Q4_000000006122222","period":202512,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":154.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21186240.17,"pred_cpr_pct":47.4239,"actual_cpr_pct":0.0,"residual":47.4239},{"loan_id":"3618G8DV0_000000006622149","period":202409,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":10.0,"refi_incentive_bps":120.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43783250.32,"pred_cpr_pct":46.9003,"actual_cpr_pct":0.0,"residual":46.9003},{"loan_id":"3618GKT46_000000003122165","period":202512,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":23.0,"refi_incentive_bps":117.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25601026.2,"pred_cpr_pct":46.5598,"actual_cpr_pct":0.0,"residual":46.5598},{"loan_id":"3618FH2L5_000000001222462","period":202601,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":27.0,"refi_incentive_bps":183.0,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67735855.3,"pred_cpr_pct":46.5102,"actual_cpr_pct":0.0,"residual":46.5102},{"loan_id":"3618BEA78_000000005111543","period":202602,"pool_cusip":"3618BEA78","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":112.0,"prepay_penalty_points":9.0,"sato_bps":125.5,"upb":14030929.13,"pred_cpr_pct":46.1923,"actual_cpr_pct":0.0,"residual":46.1923},{"loan_id":"3618GDUT5_000000007110030","period":202601,"pool_cusip":"3618GDUT5","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":23.0,"refi_incentive_bps":197.5,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":12580623.03,"pred_cpr_pct":45.2442,"actual_cpr_pct":0.0,"residual":45.2442},{"loan_id":"3618FH2Q4_000000006122222","period":202603,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":145.0,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21131976.32,"pred_cpr_pct":44.8681,"actual_cpr_pct":0.0,"residual":44.8681},{"loan_id":"3618FH2L5_000000001222462","period":202409,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":11.0,"refi_incentive_bps":102.5,"prepay_penalty_points":10.0,"sato_bps":139.5,"upb":68415916.46,"pred_cpr_pct":44.8514,"actual_cpr_pct":0.0,"residual":44.8514},{"loan_id":"3618GKT46_000000003122165","period":202603,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":120.0,"prepay_penalty_points":8.0,"sato_bps":145.0,"upb":25530668.78,"pred_cpr_pct":44.6837,"actual_cpr_pct":0.0,"residual":44.6837},{"loan_id":"3618FH2Q4_000000006122222","period":202510,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":23.0,"refi_incentive_bps":147.7,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21239468.73,"pred_cpr_pct":44.3387,"actual_cpr_pct":0.0,"residual":44.3387},{"loan_id":"3618FH2L5_000000001222462","period":202511,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":170.5,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67824353.9,"pred_cpr_pct":44.0316,"actual_cpr_pct":0.0,"residual":44.0316},{"loan_id":"36291QC51_000000007335665","period":202501,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":580.0,"refi_incentive_bps":49.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":338103.72,"pred_cpr_pct":43.9682,"actual_cpr_pct":0.0,"residual":43.9682},{"loan_id":"3618FH2L5_000000001222462","period":202512,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":167.0,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67780232.92,"pred_cpr_pct":43.8802,"actual_cpr_pct":0.0,"residual":43.8802},{"loan_id":"36291QC51_000000007335665","period":202412,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":579.0,"refi_incentive_bps":49.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":342437.76,"pred_cpr_pct":43.8315,"actual_cpr_pct":0.0,"residual":43.8315},{"loan_id":"3618FH2Q4_000000006122222","period":202408,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":9.0,"refi_incentive_bps":157.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21474750.3,"pred_cpr_pct":43.6467,"actual_cpr_pct":0.0,"residual":43.6467},{"loan_id":"3618FH2L5_000000001222462","period":202603,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":29.0,"refi_incentive_bps":157.5,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67646324.17,"pred_cpr_pct":43.5674,"actual_cpr_pct":0.0,"residual":43.5674},{"loan_id":"3618G8DV0_000000006622149","period":202511,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":101.0,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43422149.16,"pred_cpr_pct":43.4948,"actual_cpr_pct":0.0,"residual":43.4948},{"loan_id":"3618GKT46_000000003122165","period":202510,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":21.0,"refi_incentive_bps":110.2,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25647231.68,"pred_cpr_pct":43.2969,"actual_cpr_pct":0.0,"residual":43.2969},{"loan_id":"3618FTCW4_000000012622232","period":202601,"pool_cusip":"3618FTCW4","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":29.0,"refi_incentive_bps":120.5,"prepay_penalty_points":10.0,"sato_bps":164.5,"upb":17445995.51,"pred_cpr_pct":42.8741,"actual_cpr_pct":0.0,"residual":42.8741},{"loan_id":"3618BEAQ6_000000006622135","period":202602,"pool_cusip":"3618BEAQ6","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":32.0,"refi_incentive_bps":140.5,"prepay_penalty_points":8.0,"sato_bps":141.5,"upb":12278007.53,"pred_cpr_pct":42.3445,"actual_cpr_pct":0.0,"residual":42.3445},{"loan_id":"3618G8DV0_000000006622149","period":202512,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":97.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43395187.11,"pred_cpr_pct":42.1838,"actual_cpr_pct":0.0,"residual":42.1838},{"loan_id":"3618GKT46_000000003122165","period":202408,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":7.0,"refi_incentive_bps":107.5,"prepay_penalty_points":10.0,"sato_bps":145.0,"upb":25955583.59,"pred_cpr_pct":42.0246,"actual_cpr_pct":0.0,"residual":42.0246},{"loan_id":"3618G8DX6_000000010322079","period":202602,"pool_cusip":"3618G8DX6","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":158.5,"prepay_penalty_points":8.0,"sato_bps":159.5,"upb":11952641.26,"pred_cpr_pct":41.7799,"actual_cpr_pct":0.0,"residual":41.7799},{"loan_id":"3618GDUZ1_000000003222034","period":202602,"pool_cusip":"3618GDUZ1","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":20.0,"refi_incentive_bps":97.0,"prepay_penalty_points":9.0,"sato_bps":91.0,"upb":18402581.37,"pred_cpr_pct":41.5793,"actual_cpr_pct":0.0,"residual":41.5793},{"loan_id":"3617F2FW2_000000002311737","period":202602,"pool_cusip":"3617F2FW2","issuer_name":"MASSACHUSETTS HOUSING FINANCE AGENCY","fha_category":"223f","loan_purpose":"RP","affordable_status":"AFF","loan_age_months":29.0,"refi_incentive_bps":96.5,"prepay_penalty_points":10.0,"sato_bps":122.5,"upb":25309463.61,"pred_cpr_pct":41.3529,"actual_cpr_pct":0.0,"residual":41.3529},{"loan_id":"3618FH2Q4_000000006122222","period":202509,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":22.0,"refi_incentive_bps":140.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21256984.95,"pred_cpr_pct":41.1806,"actual_cpr_pct":0.0,"residual":41.1806},{"loan_id":"3618FH2P6_000000003522103","period":202602,"pool_cusip":"3618FH2P6","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":111.5,"prepay_penalty_points":8.0,"sato_bps":112.5,"upb":16942456.39,"pred_cpr_pct":40.9237,"actual_cpr_pct":0.0,"residual":40.9237},{"loan_id":"3618GDUT5_000000007110030","period":202511,"pool_cusip":"3618GDUT5","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":21.0,"refi_incentive_bps":185.0,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":12598348.32,"pred_cpr_pct":40.5703,"actual_cpr_pct":0.0,"residual":40.5703},{"loan_id":"3618GKT46_000000003122165","period":202509,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":20.0,"refi_incentive_bps":103.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25670127.08,"pred_cpr_pct":40.347,"actual_cpr_pct":0.0,"residual":40.347}],"under_pred":[{"loan_id":"3617UNUK8_048033445947166","period":202504,"pool_cusip":"3617UNUK8","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":46.0,"refi_incentive_bps":-298.0,"prepay_penalty_points":7.0,"sato_bps":59.0,"upb":1307785.88,"pred_cpr_pct":0.3003,"actual_cpr_pct":100.0,"residual":-99.6997},{"loan_id":"3617YEEJ5_015073311536283","period":202511,"pool_cusip":"3617YEEJ5","issuer_name":"MERCHANTS CAPITAL CORP.","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":203.0,"refi_incentive_bps":-222.5,"prepay_penalty_points":7.0,"sato_bps":-120.0,"upb":602852.4,"pred_cpr_pct":0.3112,"actual_cpr_pct":100.0,"residual":-99.6888},{"loan_id":"3617M3FR3_038076934888440","period":202412,"pool_cusip":"3617M3FR3","issuer_name":"MERCHANTS CAPITAL CORP.","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":56.0,"refi_incentive_bps":-305.5,"prepay_penalty_points":8.0,"sato_bps":45.0,"upb":1484841.26,"pred_cpr_pct":0.3497,"actual_cpr_pct":100.0,"residual":-99.6503},{"loan_id":"3617X5EL0_000000012311323","period":202507,"pool_cusip":"3617X5EL0","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":42.0,"refi_incentive_bps":-370.0,"prepay_penalty_points":7.0,"sato_bps":-117.0,"upb":1842104.1,"pred_cpr_pct":0.406,"actual_cpr_pct":100.0,"residual":-99.594},{"loan_id":"3617YEK74_000000005311533","period":202412,"pool_cusip":"3617YEK74","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":36.0,"refi_incentive_bps":-373.0,"prepay_penalty_points":9.0,"sato_bps":17.0,"upb":2624806.61,"pred_cpr_pct":0.4386,"actual_cpr_pct":100.0,"residual":-99.5614},{"loan_id":"3617YCZM9_048015411149626","period":202502,"pool_cusip":"3617YCZM9","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":32.0,"refi_incentive_bps":-140.5,"prepay_penalty_points":10.0,"sato_bps":120.0,"upb":862200.0,"pred_cpr_pct":0.4506,"actual_cpr_pct":100.0,"residual":-99.5494},{"loan_id":"3617W2E79_000000008511223","period":202505,"pool_cusip":"3617W2E79","issuer_name":"ARBOR AGENCY LENDING, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":45.0,"refi_incentive_bps":-398.0,"prepay_penalty_points":7.0,"sato_bps":-19.0,"upb":3682654.99,"pred_cpr_pct":0.4793,"actual_cpr_pct":100.0,"residual":-99.5207},{"loan_id":"3617W2E61_000000008511224","period":202505,"pool_cusip":"3617W2E61","issuer_name":"ARBOR AGENCY LENDING, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":45.0,"refi_incentive_bps":-398.0,"prepay_penalty_points":7.0,"sato_bps":-19.0,"upb":4091838.73,"pred_cpr_pct":0.4977,"actual_cpr_pct":100.0,"residual":-99.5023},{"loan_id":"36230Q7B8_004015350659788","period":202507,"pool_cusip":"36230Q7B8","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":161.0,"refi_incentive_bps":-115.5,"prepay_penalty_points":0.0,"sato_bps":126.5,"upb":571082.0,"pred_cpr_pct":0.6289,"actual_cpr_pct":100.0,"residual":-99.3711},{"loan_id":"3617UAZ70_000000006611242","period":202506,"pool_cusip":"3617UAZ70","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":52.0,"refi_incentive_bps":-379.5,"prepay_penalty_points":6.0,"sato_bps":-33.0,"upb":4764240.04,"pred_cpr_pct":0.6293,"actual_cpr_pct":100.0,"residual":-99.3707},{"loan_id":"3617V2W54_000000008311215","period":202412,"pool_cusip":"3617V2W54","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":45.0,"refi_incentive_bps":-373.0,"prepay_penalty_points":7.0,"sato_bps":-8.0,"upb":6135211.57,"pred_cpr_pct":0.6326,"actual_cpr_pct":100.0,"residual":-99.3674},{"loan_id":"36178BAQ8_002008123798393","period":202512,"pool_cusip":"36178BAQ8","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":160.0,"refi_incentive_bps":-169.5,"prepay_penalty_points":0.0,"sato_bps":25.5,"upb":812233.15,"pred_cpr_pct":0.6422,"actual_cpr_pct":100.0,"residual":-99.3578},{"loan_id":"3617UQPF8_000000011322041","period":202509,"pool_cusip":"3617UQPF8","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":192.0,"refi_incentive_bps":-357.5,"prepay_penalty_points":6.0,"sato_bps":-245.0,"upb":1964021.74,"pred_cpr_pct":0.6481,"actual_cpr_pct":100.0,"residual":-99.3519},{"loan_id":"36178BAR6_002008324391721","period":202512,"pool_cusip":"36178BAR6","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":160.0,"refi_incentive_bps":-169.5,"prepay_penalty_points":0.0,"sato_bps":25.5,"upb":1001305.2,"pred_cpr_pct":0.6487,"actual_cpr_pct":100.0,"residual":-99.3513},{"loan_id":"3617VK7G8_000000004711236","period":202501,"pool_cusip":"3617VK7G8","issuer_name":"GRANDBRIDGE REAL ESTATE CAPITAL, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":73.0,"refi_incentive_bps":-331.5,"prepay_penalty_points":10.0,"sato_bps":-73.0,"upb":1548568.66,"pred_cpr_pct":0.7175,"actual_cpr_pct":100.0,"residual":-99.2825},{"loan_id":"3618FJBT4_260280842105923","period":202407,"pool_cusip":"3618FJBT4","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":4.0,"refi_incentive_bps":-117.5,"prepay_penalty_points":0.0,"sato_bps":-194.0,"upb":4470123.8,"pred_cpr_pct":0.7192,"actual_cpr_pct":100.0,"residual":-99.2808},{"loan_id":"36178BA62_048038442027507","period":202601,"pool_cusip":"36178BA62","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":157.0,"refi_incentive_bps":-137.5,"prepay_penalty_points":0.0,"sato_bps":41.5,"upb":1128962.26,"pred_cpr_pct":0.7867,"actual_cpr_pct":100.0,"residual":-99.2133},{"loan_id":"36193CDB7_002015090547904","period":202410,"pool_cusip":"36193CDB7","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":169.0,"refi_incentive_bps":-60.0,"prepay_penalty_points":2.0,"sato_bps":78.0,"upb":674211.3,"pred_cpr_pct":0.7983,"actual_cpr_pct":100.0,"residual":-99.2017},{"loan_id":"3617VAED9_000000010122052","period":202407,"pool_cusip":"3617VAED9","issuer_name":"CAPITAL FUNDING,LLC.","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":155.0,"refi_incentive_bps":-324.0,"prepay_penalty_points":7.0,"sato_bps":-128.0,"upb":1612480.62,"pred_cpr_pct":0.8668,"actual_cpr_pct":100.0,"residual":-99.1332},{"loan_id":"3617XD6A6_000000004711235","period":202501,"pool_cusip":"3617XD6A6","issuer_name":"GRANDBRIDGE REAL ESTATE CAPITAL, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":73.0,"refi_incentive_bps":-277.0,"prepay_penalty_points":7.0,"sato_bps":-56.0,"upb":1277911.63,"pred_cpr_pct":0.8693,"actual_cpr_pct":100.0,"residual":-99.1307},{"loan_id":"3617VYQ51_000000011522368","period":202502,"pool_cusip":"3617VYQ51","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":43.0,"refi_incentive_bps":-346.0,"prepay_penalty_points":7.0,"sato_bps":-6.0,"upb":2768825.13,"pred_cpr_pct":0.9271,"actual_cpr_pct":100.0,"residual":-99.0729},{"loan_id":"3617XKTY3_000000005315024","period":202504,"pool_cusip":"3617XKTY3","issuer_name":"PGIM REAL ESTATE AGENCY FINANCING, LLC.","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":38.0,"refi_incentive_bps":-252.5,"prepay_penalty_points":10.0,"sato_bps":25.0,"upb":532970.65,"pred_cpr_pct":0.9281,"actual_cpr_pct":100.0,"residual":-99.0719},{"loan_id":"3617UKYG9_000000017635049","period":202411,"pool_cusip":"3617UKYG9","issuer_name":"MIDLAND STATES BANK","fha_category":"221d4","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":154.0,"refi_incentive_bps":-353.0,"prepay_penalty_points":7.0,"sato_bps":-62.5,"upb":527410.3,"pred_cpr_pct":0.9293,"actual_cpr_pct":100.0,"residual":-99.0707},{"loan_id":"3617JFZE7_000000008711120","period":202408,"pool_cusip":"3617JFZE7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":57.0,"refi_incentive_bps":-243.5,"prepay_penalty_points":6.0,"sato_bps":-45.0,"upb":2185669.07,"pred_cpr_pct":0.9389,"actual_cpr_pct":100.0,"residual":-99.0611},{"loan_id":"3617W7EG8_000000004711036","period":202501,"pool_cusip":"3617W7EG8","issuer_name":"PNC BANK, NA","fha_category":"223f","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":40.0,"refi_incentive_bps":-328.0,"prepay_penalty_points":7.0,"sato_bps":37.0,"upb":739047.82,"pred_cpr_pct":0.9498,"actual_cpr_pct":100.0,"residual":-99.0502},{"loan_id":"3617VHTP1_000000003411220","period":202510,"pool_cusip":"3617VHTP1","issuer_name":"PGIM REAL ESTATE AGENCY FINANCING, LLC.","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":104.0,"refi_incentive_bps":-298.8,"prepay_penalty_points":7.0,"sato_bps":-58.0,"upb":1797303.74,"pred_cpr_pct":0.9555,"actual_cpr_pct":100.0,"residual":-99.0445},{"loan_id":"3617X74C7_000000004711038","period":202408,"pool_cusip":"3617X74C7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":217.0,"refi_incentive_bps":-320.5,"prepay_penalty_points":8.0,"sato_bps":-242.0,"upb":1209996.82,"pred_cpr_pct":0.97,"actual_cpr_pct":100.0,"residual":-99.03},{"loan_id":"3617LXWZ1_000000008511211","period":202510,"pool_cusip":"3617LXWZ1","issuer_name":"GERSHMAN INVESTMENT CORP.","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":70.0,"refi_incentive_bps":-331.3,"prepay_penalty_points":10.0,"sato_bps":-73.0,"upb":5332723.81,"pred_cpr_pct":0.9737,"actual_cpr_pct":100.0,"residual":-99.0263},{"loan_id":"3617YUSU9_000000005411224","period":202512,"pool_cusip":"3617YUSU9","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":43.0,"refi_incentive_bps":-253.0,"prepay_penalty_points":7.0,"sato_bps":-47.0,"upb":5000128.58,"pred_cpr_pct":0.9789,"actual_cpr_pct":100.0,"residual":-99.0211},{"loan_id":"3617VK7H6_000000004711237","period":202501,"pool_cusip":"3617VK7H6","issuer_name":"GRANDBRIDGE REAL ESTATE CAPITAL, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"AFF","loan_age_months":73.0,"refi_incentive_bps":-327.5,"prepay_penalty_points":10.0,"sato_bps":-69.0,"upb":1730128.64,"pred_cpr_pct":1.0133,"actual_cpr_pct":100.0,"residual":-98.9867},{"loan_id":"3617NNDF6_000000001643129","period":202412,"pool_cusip":"3617NNDF6","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":166.0,"refi_incentive_bps":-311.5,"prepay_penalty_points":6.0,"sato_bps":-94.0,"upb":4473540.19,"pred_cpr_pct":1.0243,"actual_cpr_pct":100.0,"residual":-98.9757},{"loan_id":"3617QQVV1_000000008535533","period":202504,"pool_cusip":"3617QQVV1","issuer_name":"GERSHMAN INVESTMENT CORP.","fha_category":"221d4","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":53.0,"refi_incentive_bps":-390.5,"prepay_penalty_points":10.0,"sato_bps":-23.0,"upb":1136199.58,"pred_cpr_pct":1.0338,"actual_cpr_pct":100.0,"residual":-98.9662},{"loan_id":"3617VA6C0_000000004222177","period":202512,"pool_cusip":"3617VA6C0","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":160.0,"refi_incentive_bps":-303.5,"prepay_penalty_points":6.0,"sato_bps":-33.5,"upb":3393295.12,"pred_cpr_pct":1.0646,"actual_cpr_pct":100.0,"residual":-98.9354},{"loan_id":"3617NNDG4_000000001643127","period":202412,"pool_cusip":"3617NNDG4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":166.0,"refi_incentive_bps":-311.5,"prepay_penalty_points":6.0,"sato_bps":-94.0,"upb":4565527.54,"pred_cpr_pct":1.0662,"actual_cpr_pct":100.0,"residual":-98.9338},{"loan_id":"3617M7D39_000000011322046","period":202510,"pool_cusip":"3617M7D39","issuer_name":"CAPITAL FUNDING,LLC.","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":191.0,"refi_incentive_bps":-282.8,"prepay_penalty_points":5.0,"sato_bps":-190.0,"upb":4362615.11,"pred_cpr_pct":1.0686,"actual_cpr_pct":100.0,"residual":-98.9314},{"loan_id":"3617LKRN2_000000010122036","period":202407,"pool_cusip":"3617LKRN2","issuer_name":"PGIM REAL ESTATE AGENCY FINANCING, LLC.","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":214.0,"refi_incentive_bps":-229.0,"prepay_penalty_points":7.0,"sato_bps":-152.0,"upb":774484.63,"pred_cpr_pct":1.071,"actual_cpr_pct":100.0,"residual":-98.929},{"loan_id":"3617Y0BB5_000000010122162","period":202503,"pool_cusip":"3617Y0BB5","issuer_name":"VIUM CAPITAL MORTGAGE, LLC.","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":40.0,"refi_incentive_bps":-359.0,"prepay_penalty_points":7.0,"sato_bps":-14.0,"upb":5843483.15,"pred_cpr_pct":1.0972,"actual_cpr_pct":100.0,"residual":-98.9028},{"loan_id":"36189NJU1_050010204328989","period":202412,"pool_cusip":"36189NJU1","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":184.0,"refi_incentive_bps":-56.5,"prepay_penalty_points":0.0,"sato_bps":9.0,"upb":1248248.02,"pred_cpr_pct":1.1079,"actual_cpr_pct":100.0,"residual":-98.8921},{"loan_id":"36192SB25_050014048210742","period":202412,"pool_cusip":"36192SB25","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":184.0,"refi_incentive_bps":-53.5,"prepay_penalty_points":0.0,"sato_bps":12.0,"upb":918754.92,"pred_cpr_pct":1.1096,"actual_cpr_pct":100.0,"residual":-98.8904},{"loan_id":"3617NTHV4_000000012122110","period":202510,"pool_cusip":"3617NTHV4","issuer_name":"GERSHMAN INVESTMENT CORP.","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":63.0,"refi_incentive_bps":-355.3,"prepay_penalty_points":10.0,"sato_bps":-15.0,"upb":2955261.38,"pred_cpr_pct":1.111,"actual_cpr_pct":100.0,"residual":-98.889},{"loan_id":"3617G9ZA2_000000007311957","period":202511,"pool_cusip":"3617G9ZA2","issuer_name":"PNC BANK, NA","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":73.0,"refi_incentive_bps":-255.5,"prepay_penalty_points":5.0,"sato_bps":-70.0,"upb":3055229.02,"pred_cpr_pct":1.119,"actual_cpr_pct":100.0,"residual":-98.881},{"loan_id":"3617VLTK3_000000008611125","period":202509,"pool_cusip":"3617VLTK3","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"AFF","loan_age_months":52.0,"refi_incentive_bps":-303.5,"prepay_penalty_points":6.0,"sato_bps":21.0,"upb":4185058.72,"pred_cpr_pct":1.1273,"actual_cpr_pct":100.0,"residual":-98.8727},{"loan_id":"3617URV51_000000007111508","period":202601,"pool_cusip":"3617URV51","issuer_name":"MERCHANTS CAPITAL SERVICING LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":57.0,"refi_incentive_bps":-277.5,"prepay_penalty_points":6.0,"sato_bps":17.0,"upb":6373198.15,"pred_cpr_pct":1.1282,"actual_cpr_pct":100.0,"residual":-98.8718},{"loan_id":"3620A0BC3_009047014711780","period":202508,"pool_cusip":"3620A0BC3","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":218.0,"refi_incentive_bps":208.5,"prepay_penalty_points":0.0,"sato_bps":262.0,"upb":610426.14,"pred_cpr_pct":1.1287,"actual_cpr_pct":100.0,"residual":-98.8713},{"loan_id":"3617N3PY6_000000007135968","period":202412,"pool_cusip":"3617N3PY6","issuer_name":"LEGACY CAPITAL MORTGAGE, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":3.0,"refi_incentive_bps":-112.5,"prepay_penalty_points":10.0,"sato_bps":-30.0,"upb":2853100.0,"pred_cpr_pct":1.1356,"actual_cpr_pct":100.0,"residual":-98.8644},{"loan_id":"3617X74D5_000000004322086","period":202512,"pool_cusip":"3617X74D5","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":150.0,"refi_incentive_bps":-311.0,"prepay_penalty_points":7.0,"sato_bps":-68.0,"upb":3197866.7,"pred_cpr_pct":1.1511,"actual_cpr_pct":100.0,"residual":-98.8489},{"loan_id":"36195YXK5_000000001211390","period":202504,"pool_cusip":"36195YXK5","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"BAF","loan_age_months":100.0,"refi_incentive_bps":-263.5,"prepay_penalty_points":2.0,"sato_bps":-56.0,"upb":2219208.87,"pred_cpr_pct":1.1696,"actual_cpr_pct":100.0,"residual":-98.8304},{"loan_id":"3620A0BD1_009032774969131","period":202508,"pool_cusip":"3620A0BD1","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":218.0,"refi_incentive_bps":208.5,"prepay_penalty_points":0.0,"sato_bps":262.0,"upb":1377823.42,"pred_cpr_pct":1.1754,"actual_cpr_pct":100.0,"residual":-98.8246},{"loan_id":"36182M4W2_000000006535652","period":202412,"pool_cusip":"36182M4W2","issuer_name":"GERSHMAN INVESTMENT CORP.","fha_category":"221d4","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":63.0,"refi_incentive_bps":-342.5,"prepay_penalty_points":10.0,"sato_bps":-49.0,"upb":1106792.76,"pred_cpr_pct":1.1789,"actual_cpr_pct":100.0,"residual":-98.8211},{"loan_id":"3617URTW5_000000005322253","period":202505,"pool_cusip":"3617URTW5","issuer_name":"M&T REALTY CAPITAL CORPORATION","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":44.0,"refi_incentive_bps":-362.0,"prepay_penalty_points":7.0,"sato_bps":17.0,"upb":6192087.8,"pred_cpr_pct":1.1934,"actual_cpr_pct":100.0,"residual":-98.8066}],"high_pred":[{"loan_id":"3618GKT46_000000003122165","period":202602,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":151.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25554262.27,"pred_cpr_pct":60.9984,"actual_cpr_pct":0.0,"residual":60.9984},{"loan_id":"3618FH2Q4_000000006122222","period":202602,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":27.0,"refi_incentive_bps":188.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21168268.24,"pred_cpr_pct":60.1704,"actual_cpr_pct":0.0,"residual":60.1704},{"loan_id":"36291QC51_000000007335665","period":202409,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":576.0,"refi_incentive_bps":114.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":355314.12,"pred_cpr_pct":58.6701,"actual_cpr_pct":0.0,"residual":58.6701},{"loan_id":"3618G8DV0_000000006622149","period":202602,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":27.0,"refi_incentive_bps":131.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43340779.43,"pred_cpr_pct":57.5354,"actual_cpr_pct":0.0,"residual":57.5354},{"loan_id":"36291QC51_000000007335665","period":202408,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":575.0,"refi_incentive_bps":94.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":359564.66,"pred_cpr_pct":54.8561,"actual_cpr_pct":0.0,"residual":54.8561},{"loan_id":"3618FH2Q4_000000006122222","period":202601,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":170.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21186240.17,"pred_cpr_pct":53.3403,"actual_cpr_pct":0.0,"residual":53.3403},{"loan_id":"3618GKT46_000000003122165","period":202601,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":133.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25577714.46,"pred_cpr_pct":53.2682,"actual_cpr_pct":0.0,"residual":53.2682},{"loan_id":"36291QC51_000000007335665","period":202411,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":578.0,"refi_incentive_bps":83.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":346750.77,"pred_cpr_pct":52.377,"actual_cpr_pct":0.0,"residual":52.377},{"loan_id":"36291QC51_000000007335665","period":202407,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":574.0,"refi_incentive_bps":83.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":363794.58,"pred_cpr_pct":51.7859,"actual_cpr_pct":0.0,"residual":51.7859},{"loan_id":"3618GDUT5_000000007110030","period":202602,"pool_cusip":"3618GDUT5","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":215.5,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":12571671.66,"pred_cpr_pct":51.7388,"actual_cpr_pct":0.0,"residual":51.7388},{"loan_id":"3618FTCW4_000000012622232","period":202602,"pool_cusip":"3618FTCW4","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":30.0,"refi_incentive_bps":138.5,"prepay_penalty_points":10.0,"sato_bps":164.5,"upb":17435188.93,"pred_cpr_pct":50.6369,"actual_cpr_pct":0.0,"residual":50.6369},{"loan_id":"3618FH2Q4_000000006122222","period":202409,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":10.0,"refi_incentive_bps":177.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21442419.61,"pred_cpr_pct":50.5265,"actual_cpr_pct":0.0,"residual":50.5265},{"loan_id":"36291QC51_000000007335665","period":202502,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":581.0,"refi_incentive_bps":74.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":333748.56,"pred_cpr_pct":50.4566,"actual_cpr_pct":0.0,"residual":50.4566},{"loan_id":"3618GKT46_000000003122165","period":202409,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":8.0,"refi_incentive_bps":127.5,"prepay_penalty_points":10.0,"sato_bps":145.0,"upb":25934408.06,"pred_cpr_pct":50.3966,"actual_cpr_pct":0.0,"residual":50.3966},{"loan_id":"3618FH2L5_000000001222462","period":202602,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":201.0,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67691219.55,"pred_cpr_pct":49.5119,"actual_cpr_pct":0.0,"residual":49.5119},{"loan_id":"3618G8DV0_000000006622149","period":202601,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":113.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43368064.19,"pred_cpr_pct":49.3369,"actual_cpr_pct":0.0,"residual":49.3369},{"loan_id":"36291QC51_000000007335665","period":202503,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":582.0,"refi_incentive_bps":69.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":329372.16,"pred_cpr_pct":49.305,"actual_cpr_pct":0.0,"residual":49.305},{"loan_id":"3618FH2Q4_000000006122222","period":202511,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":158.0,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21221839.68,"pred_cpr_pct":48.2933,"actual_cpr_pct":0.0,"residual":48.2933},{"loan_id":"36291QC51_000000007335665","period":202410,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":577.0,"refi_incentive_bps":67.0,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":351042.86,"pred_cpr_pct":47.9449,"actual_cpr_pct":0.0,"residual":47.9449},{"loan_id":"3618AWG24_000000005310040","period":202602,"pool_cusip":"3618AWG24","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"241","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":105.5,"prepay_penalty_points":10.0,"sato_bps":131.5,"upb":15104704.59,"pred_cpr_pct":47.7536,"actual_cpr_pct":0.0,"residual":47.7536},{"loan_id":"3618GKT46_000000003122165","period":202511,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":22.0,"refi_incentive_bps":120.5,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25624198.33,"pred_cpr_pct":47.5601,"actual_cpr_pct":0.0,"residual":47.5601},{"loan_id":"3618FH2Q4_000000006122222","period":202512,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":154.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21186240.17,"pred_cpr_pct":47.4239,"actual_cpr_pct":0.0,"residual":47.4239},{"loan_id":"3618G8DV0_000000006622149","period":202409,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":10.0,"refi_incentive_bps":120.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43783250.32,"pred_cpr_pct":46.9003,"actual_cpr_pct":0.0,"residual":46.9003},{"loan_id":"3618GKT46_000000003122165","period":202512,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":23.0,"refi_incentive_bps":117.0,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25601026.2,"pred_cpr_pct":46.5598,"actual_cpr_pct":0.0,"residual":46.5598},{"loan_id":"3618FH2L5_000000001222462","period":202601,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":27.0,"refi_incentive_bps":183.0,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67735855.3,"pred_cpr_pct":46.5102,"actual_cpr_pct":0.0,"residual":46.5102},{"loan_id":"36291QC51_000000007335665","period":202504,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":583.0,"refi_incentive_bps":57.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":329372.16,"pred_cpr_pct":46.3988,"actual_cpr_pct":100.0,"residual":-53.6012},{"loan_id":"3618BEA78_000000005111543","period":202602,"pool_cusip":"3618BEA78","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223f","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":112.0,"prepay_penalty_points":9.0,"sato_bps":125.5,"upb":14030929.13,"pred_cpr_pct":46.1923,"actual_cpr_pct":0.0,"residual":46.1923},{"loan_id":"3618GDUT5_000000007110030","period":202601,"pool_cusip":"3618GDUT5","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":23.0,"refi_incentive_bps":197.5,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":12580623.03,"pred_cpr_pct":45.2442,"actual_cpr_pct":0.0,"residual":45.2442},{"loan_id":"3618FH2Q4_000000006122222","period":202603,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":145.0,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21131976.32,"pred_cpr_pct":44.8681,"actual_cpr_pct":0.0,"residual":44.8681},{"loan_id":"3618FH2L5_000000001222462","period":202409,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":11.0,"refi_incentive_bps":102.5,"prepay_penalty_points":10.0,"sato_bps":139.5,"upb":68415916.46,"pred_cpr_pct":44.8514,"actual_cpr_pct":0.0,"residual":44.8514},{"loan_id":"3618GKT46_000000003122165","period":202603,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":120.0,"prepay_penalty_points":8.0,"sato_bps":145.0,"upb":25530668.78,"pred_cpr_pct":44.6837,"actual_cpr_pct":0.0,"residual":44.6837},{"loan_id":"3618FH2Q4_000000006122222","period":202510,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":23.0,"refi_incentive_bps":147.7,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21239468.73,"pred_cpr_pct":44.3387,"actual_cpr_pct":0.0,"residual":44.3387},{"loan_id":"3618FH2L5_000000001222462","period":202511,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":170.5,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67824353.9,"pred_cpr_pct":44.0316,"actual_cpr_pct":0.0,"residual":44.0316},{"loan_id":"36291QC51_000000007335665","period":202501,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":580.0,"refi_incentive_bps":49.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":338103.72,"pred_cpr_pct":43.9682,"actual_cpr_pct":0.0,"residual":43.9682},{"loan_id":"3618FH2L5_000000001222462","period":202512,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":167.0,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67780232.92,"pred_cpr_pct":43.8802,"actual_cpr_pct":0.0,"residual":43.8802},{"loan_id":"36291QC51_000000007335665","period":202412,"pool_cusip":"36291QC51","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"223a7","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":579.0,"refi_incentive_bps":49.5,"prepay_penalty_points":0.0,"sato_bps":-132.5,"upb":342437.76,"pred_cpr_pct":43.8315,"actual_cpr_pct":0.0,"residual":43.8315},{"loan_id":"3618FH2Q4_000000006122222","period":202408,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":9.0,"refi_incentive_bps":157.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21474750.3,"pred_cpr_pct":43.6467,"actual_cpr_pct":0.0,"residual":43.6467},{"loan_id":"3618FH2L5_000000001222462","period":202603,"pool_cusip":"3618FH2L5","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":29.0,"refi_incentive_bps":157.5,"prepay_penalty_points":3.0,"sato_bps":139.5,"upb":67646324.17,"pred_cpr_pct":43.5674,"actual_cpr_pct":0.0,"residual":43.5674},{"loan_id":"3618G8DV0_000000006622149","period":202511,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":24.0,"refi_incentive_bps":101.0,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43422149.16,"pred_cpr_pct":43.4948,"actual_cpr_pct":0.0,"residual":43.4948},{"loan_id":"3618GKT46_000000003122165","period":202510,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":21.0,"refi_incentive_bps":110.2,"prepay_penalty_points":9.0,"sato_bps":145.0,"upb":25647231.68,"pred_cpr_pct":43.2969,"actual_cpr_pct":0.0,"residual":43.2969},{"loan_id":"3618FTCW4_000000012622232","period":202601,"pool_cusip":"3618FTCW4","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":29.0,"refi_incentive_bps":120.5,"prepay_penalty_points":10.0,"sato_bps":164.5,"upb":17445995.51,"pred_cpr_pct":42.8741,"actual_cpr_pct":0.0,"residual":42.8741},{"loan_id":"3618BEAQ6_000000006622135","period":202602,"pool_cusip":"3618BEAQ6","issuer_name":"BERKADIA COMMERCIAL MORTGAGE, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":32.0,"refi_incentive_bps":140.5,"prepay_penalty_points":8.0,"sato_bps":141.5,"upb":12278007.53,"pred_cpr_pct":42.3445,"actual_cpr_pct":0.0,"residual":42.3445},{"loan_id":"3618G8DV0_000000006622149","period":202512,"pool_cusip":"3618G8DV0","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":25.0,"refi_incentive_bps":97.5,"prepay_penalty_points":10.0,"sato_bps":157.5,"upb":43395187.11,"pred_cpr_pct":42.1838,"actual_cpr_pct":0.0,"residual":42.1838},{"loan_id":"3618GKT46_000000003122165","period":202408,"pool_cusip":"3618GKT46","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":7.0,"refi_incentive_bps":107.5,"prepay_penalty_points":10.0,"sato_bps":145.0,"upb":25955583.59,"pred_cpr_pct":42.0246,"actual_cpr_pct":0.0,"residual":42.0246},{"loan_id":"3618G8DX6_000000010322079","period":202602,"pool_cusip":"3618G8DX6","issuer_name":"GREYSTONE FUNDING COMPANY LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":26.0,"refi_incentive_bps":158.5,"prepay_penalty_points":8.0,"sato_bps":159.5,"upb":11952641.26,"pred_cpr_pct":41.7799,"actual_cpr_pct":0.0,"residual":41.7799},{"loan_id":"3618GDUZ1_000000003222034","period":202602,"pool_cusip":"3618GDUZ1","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":20.0,"refi_incentive_bps":97.0,"prepay_penalty_points":9.0,"sato_bps":91.0,"upb":18402581.37,"pred_cpr_pct":41.5793,"actual_cpr_pct":0.0,"residual":41.5793},{"loan_id":"3617F2FW2_000000002311737","period":202602,"pool_cusip":"3617F2FW2","issuer_name":"MASSACHUSETTS HOUSING FINANCE AGENCY","fha_category":"223f","loan_purpose":"RP","affordable_status":"AFF","loan_age_months":29.0,"refi_incentive_bps":96.5,"prepay_penalty_points":10.0,"sato_bps":122.5,"upb":25309463.61,"pred_cpr_pct":41.3529,"actual_cpr_pct":0.0,"residual":41.3529},{"loan_id":"3618FH2Q4_000000006122222","period":202509,"pool_cusip":"3618FH2Q4","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":22.0,"refi_incentive_bps":140.5,"prepay_penalty_points":10.0,"sato_bps":214.5,"upb":21256984.95,"pred_cpr_pct":41.1806,"actual_cpr_pct":0.0,"residual":41.1806},{"loan_id":"3618FH2P6_000000003522103","period":202602,"pool_cusip":"3618FH2P6","issuer_name":"NEWPOINT REAL ESTATE CAPITAL LLC","fha_category":"232","loan_purpose":"RP","affordable_status":"MKT","loan_age_months":28.0,"refi_incentive_bps":111.5,"prepay_penalty_points":8.0,"sato_bps":112.5,"upb":16942456.39,"pred_cpr_pct":40.9237,"actual_cpr_pct":0.0,"residual":40.9237},{"loan_id":"3618GDUT5_000000007110030","period":202511,"pool_cusip":"3618GDUT5","issuer_name":"WALKER & DUNLOP, LLC","fha_category":"232","loan_purpose":"NC","affordable_status":"MKT","loan_age_months":21.0,"refi_incentive_bps":185.0,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":12598348.32,"pred_cpr_pct":40.5703,"actual_cpr_pct":0.0,"residual":40.5703}],"low_pred":[{"loan_id":"3617X2WC7_260520257854222","period":202505,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":41.0,"refi_incentive_bps":-215.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1124511.15,"pred_cpr_pct":0.1838,"actual_cpr_pct":0.0,"residual":0.1838},{"loan_id":"3617Q5WH7_410660154223671","period":202505,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":219.0,"refi_incentive_bps":-374.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1917351.35,"pred_cpr_pct":0.1895,"actual_cpr_pct":0.0,"residual":0.1895},{"loan_id":"3617X2WC7_260520257854222","period":202507,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":43.0,"refi_incentive_bps":-206.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1122536.34,"pred_cpr_pct":0.1917,"actual_cpr_pct":0.0,"residual":0.1917},{"loan_id":"3617X2WC7_260520257854222","period":202501,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":37.0,"refi_incentive_bps":-201.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1128415.84,"pred_cpr_pct":0.1939,"actual_cpr_pct":0.0,"residual":0.1939},{"loan_id":"3617Y7MQ5_440650182308814","period":202412,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":36.0,"refi_incentive_bps":-335.5,"prepay_penalty_points":10.0,"sato_bps":67.0,"upb":943324.95,"pred_cpr_pct":0.197,"actual_cpr_pct":0.0,"residual":0.197},{"loan_id":"3617Q5WH7_410660154223671","period":202412,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":214.0,"refi_incentive_bps":-360.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1941452.05,"pred_cpr_pct":0.1971,"actual_cpr_pct":0.0,"residual":0.1971},{"loan_id":"3617Q5WH7_410660154223671","period":202501,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":215.0,"refi_incentive_bps":-360.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1936655.95,"pred_cpr_pct":0.1979,"actual_cpr_pct":0.0,"residual":0.1979},{"loan_id":"3617Q5WH7_410660154223671","period":202507,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":221.0,"refi_incentive_bps":-365.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1907626.51,"pred_cpr_pct":0.1988,"actual_cpr_pct":0.0,"residual":0.1988},{"loan_id":"3617X2WC7_260520257854222","period":202506,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":42.0,"refi_incentive_bps":-195.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1123525.63,"pred_cpr_pct":0.2007,"actual_cpr_pct":0.0,"residual":0.2007},{"loan_id":"3617X2WC7_260520257854222","period":202504,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":40.0,"refi_incentive_bps":-193.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1125492.92,"pred_cpr_pct":0.2018,"actual_cpr_pct":0.0,"residual":0.2018},{"loan_id":"3617Y7MQ5_440650182308814","period":202505,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":41.0,"refi_incentive_bps":-337.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":937796.13,"pred_cpr_pct":0.2019,"actual_cpr_pct":0.0,"residual":0.2019},{"loan_id":"3617Y7MQ5_440650182308814","period":202501,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":37.0,"refi_incentive_bps":-323.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":942225.16,"pred_cpr_pct":0.203,"actual_cpr_pct":0.0,"residual":0.203},{"loan_id":"3617Q5WH7_410660154223671","period":202506,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":220.0,"refi_incentive_bps":-354.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1912495.0,"pred_cpr_pct":0.2075,"actual_cpr_pct":0.0,"residual":0.2075},{"loan_id":"3617Q5WH7_410660154223671","period":202504,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":218.0,"refi_incentive_bps":-352.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1922195.59,"pred_cpr_pct":0.2075,"actual_cpr_pct":0.0,"residual":0.2075},{"loan_id":"3617X2WC7_260520257854222","period":202508,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":44.0,"refi_incentive_bps":-187.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1121543.26,"pred_cpr_pct":0.2085,"actual_cpr_pct":0.0,"residual":0.2085},{"loan_id":"3617Q5WH7_410660154223671","period":202410,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":212.0,"refi_incentive_bps":-343.0,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1951008.4,"pred_cpr_pct":0.2107,"actual_cpr_pct":0.0,"residual":0.2107},{"loan_id":"3617Y7MQ5_440650182308814","period":202410,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":34.0,"refi_incentive_bps":-318.0,"prepay_penalty_points":10.0,"sato_bps":67.0,"upb":945515.63,"pred_cpr_pct":0.2119,"actual_cpr_pct":0.0,"residual":0.2119},{"loan_id":"3617X2WC7_260520257854222","period":202503,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":39.0,"refi_incentive_bps":-181.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1126470.95,"pred_cpr_pct":0.2121,"actual_cpr_pct":0.0,"residual":0.2121},{"loan_id":"3617Y7MQ5_440650182308814","period":202507,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":43.0,"refi_incentive_bps":-328.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":936678.35,"pred_cpr_pct":0.2158,"actual_cpr_pct":0.0,"residual":0.2158},{"loan_id":"3617X2WC7_260520257854222","period":202502,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":38.0,"refi_incentive_bps":-176.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1127445.25,"pred_cpr_pct":0.2164,"actual_cpr_pct":0.0,"residual":0.2164},{"loan_id":"3617Q5WH7_410660154223671","period":202508,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":222.0,"refi_incentive_bps":-346.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1902745.85,"pred_cpr_pct":0.2167,"actual_cpr_pct":0.0,"residual":0.2167},{"loan_id":"3617Q5WH7_410660154223671","period":202503,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":217.0,"refi_incentive_bps":-340.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1927027.75,"pred_cpr_pct":0.2176,"actual_cpr_pct":0.0,"residual":0.2176},{"loan_id":"3617Y7MQ5_440650182308814","period":202504,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":40.0,"refi_incentive_bps":-315.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":938907.88,"pred_cpr_pct":0.219,"actual_cpr_pct":0.0,"residual":0.219},{"loan_id":"3617VLRZ2_038045513940298","period":202407,"pool_cusip":"3617VLRZ2","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":36.0,"refi_incentive_bps":-148.5,"prepay_penalty_points":10.0,"sato_bps":220.0,"upb":243499.32,"pred_cpr_pct":0.2205,"actual_cpr_pct":0.0,"residual":0.2205},{"loan_id":"3617VLR25_038039846670555","period":202407,"pool_cusip":"3617VLR25","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":36.0,"refi_incentive_bps":-146.5,"prepay_penalty_points":10.0,"sato_bps":222.0,"upb":301978.29,"pred_cpr_pct":0.2213,"actual_cpr_pct":0.0,"residual":0.2213},{"loan_id":"3617Q5WH7_410660154223671","period":202502,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":216.0,"refi_incentive_bps":-335.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1931847.86,"pred_cpr_pct":0.2214,"actual_cpr_pct":0.0,"residual":0.2214},{"loan_id":"3617X2WC7_260520257854222","period":202509,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":45.0,"refi_incentive_bps":-173.5,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1120546.38,"pred_cpr_pct":0.2219,"actual_cpr_pct":0.0,"residual":0.2219},{"loan_id":"3617Y7MQ5_440650182308814","period":202506,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":42.0,"refi_incentive_bps":-317.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":937796.13,"pred_cpr_pct":0.2232,"actual_cpr_pct":0.0,"residual":0.2232},{"loan_id":"3617Q5WH7_410660154223671","period":202407,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":209.0,"refi_incentive_bps":-326.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1965253.75,"pred_cpr_pct":0.2234,"actual_cpr_pct":0.0,"residual":0.2234},{"loan_id":"3617VLR74_016062289475396","period":202410,"pool_cusip":"3617VLR74","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":36.0,"refi_incentive_bps":-318.0,"prepay_penalty_points":10.0,"sato_bps":67.0,"upb":463523.81,"pred_cpr_pct":0.2258,"actual_cpr_pct":0.0,"residual":0.2258},{"loan_id":"3617VLSR9_006004048178440","period":202412,"pool_cusip":"3617VLSR9","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":36.0,"refi_incentive_bps":-325.5,"prepay_penalty_points":10.0,"sato_bps":77.0,"upb":1363395.64,"pred_cpr_pct":0.2261,"actual_cpr_pct":0.0,"residual":0.2261},{"loan_id":"3617Y7MQ5_440650182308814","period":202407,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":31.0,"refi_incentive_bps":-301.5,"prepay_penalty_points":10.0,"sato_bps":67.0,"upb":949861.6,"pred_cpr_pct":0.2268,"actual_cpr_pct":0.0,"residual":0.2268},{"loan_id":"3617VLR25_038039846670555","period":202505,"pool_cusip":"3617VLR25","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":46.0,"refi_incentive_bps":-157.0,"prepay_penalty_points":7.0,"sato_bps":222.0,"upb":299472.85,"pred_cpr_pct":0.2268,"actual_cpr_pct":0.0,"residual":0.2268},{"loan_id":"3617VLRZ2_038045513940298","period":202505,"pool_cusip":"3617VLRZ2","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":46.0,"refi_incentive_bps":-159.0,"prepay_penalty_points":7.0,"sato_bps":220.0,"upb":241469.7,"pred_cpr_pct":0.2271,"actual_cpr_pct":0.0,"residual":0.2271},{"loan_id":"3617YEEJ5_015073311536283","period":202412,"pool_cusip":"3617YEEJ5","issuer_name":"MERCHANTS CAPITAL CORP.","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":192.0,"refi_incentive_bps":-280.5,"prepay_penalty_points":8.0,"sato_bps":-120.0,"upb":616634.38,"pred_cpr_pct":0.2271,"actual_cpr_pct":0.0,"residual":0.2271},{"loan_id":"3617Q5WH7_410660154223671","period":202411,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":213.0,"refi_incentive_bps":-326.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1946236.19,"pred_cpr_pct":0.2273,"actual_cpr_pct":0.0,"residual":0.2273},{"loan_id":"3617Y7MQ5_440650182308814","period":202503,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":39.0,"refi_incentive_bps":-303.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":941122.39,"pred_cpr_pct":0.2275,"actual_cpr_pct":0.0,"residual":0.2275},{"loan_id":"3617Y7MQ5_440650182308814","period":202411,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":35.0,"refi_incentive_bps":-301.5,"prepay_penalty_points":10.0,"sato_bps":67.0,"upb":944421.77,"pred_cpr_pct":0.2278,"actual_cpr_pct":0.0,"residual":0.2278},{"loan_id":"3617VLSA6_050001247062658","period":202410,"pool_cusip":"3617VLSA6","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":37.0,"refi_incentive_bps":-153.0,"prepay_penalty_points":8.0,"sato_bps":207.0,"upb":1106678.78,"pred_cpr_pct":0.228,"actual_cpr_pct":0.0,"residual":0.228},{"loan_id":"3617YEEJ5_015073311536283","period":202501,"pool_cusip":"3617YEEJ5","issuer_name":"MERCHANTS CAPITAL CORP.","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":193.0,"refi_incentive_bps":-280.5,"prepay_penalty_points":8.0,"sato_bps":-120.0,"upb":615274.43,"pred_cpr_pct":0.2281,"actual_cpr_pct":0.0,"residual":0.2281},{"loan_id":"3617Y7MQ5_440650182308814","period":202502,"pool_cusip":"3617Y7MQ5","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":38.0,"refi_incentive_bps":-298.0,"prepay_penalty_points":9.0,"sato_bps":67.0,"upb":942225.16,"pred_cpr_pct":0.2292,"actual_cpr_pct":0.0,"residual":0.2292},{"loan_id":"3617X2WC7_260520257854222","period":202510,"pool_cusip":"3617X2WC7","issuer_name":"BELLWETHER ENTERPRISE REAL ESTATE CAPITA","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":46.0,"refi_incentive_bps":-166.3,"prepay_penalty_points":10.0,"sato_bps":201.0,"upb":1119545.69,"pred_cpr_pct":0.2293,"actual_cpr_pct":0.0,"residual":0.2293},{"loan_id":"3617LUBY3_022007632210208","period":202412,"pool_cusip":"3617LUBY3","issuer_name":"CHURCHILL MORTGAGE INVESTMENT LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":41.0,"refi_incentive_bps":-267.5,"prepay_penalty_points":8.0,"sato_bps":110.0,"upb":820220.6,"pred_cpr_pct":0.2301,"actual_cpr_pct":0.0,"residual":0.2301},{"loan_id":"3617UNUE2_038049665785272","period":202505,"pool_cusip":"3617UNUE2","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":49.0,"refi_incentive_bps":-129.0,"prepay_penalty_points":7.0,"sato_bps":250.0,"upb":203008.56,"pred_cpr_pct":0.2303,"actual_cpr_pct":0.0,"residual":0.2303},{"loan_id":"3617VLRZ2_038045513940298","period":202412,"pool_cusip":"3617VLRZ2","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":41.0,"refi_incentive_bps":-145.0,"prepay_penalty_points":7.0,"sato_bps":220.0,"upb":242494.59,"pred_cpr_pct":0.2305,"actual_cpr_pct":0.0,"residual":0.2305},{"loan_id":"3617VLSA6_050001247062658","period":202505,"pool_cusip":"3617VLSA6","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":44.0,"refi_incentive_bps":-172.0,"prepay_penalty_points":7.0,"sato_bps":207.0,"upb":1094601.58,"pred_cpr_pct":0.231,"actual_cpr_pct":0.0,"residual":0.231},{"loan_id":"3617Q5WH7_410660154223671","period":202509,"pool_cusip":"3617Q5WH7","issuer_name":"LUMENT REAL ESTATE CAPITAL,LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":223.0,"refi_incentive_bps":-332.5,"prepay_penalty_points":10.0,"sato_bps":-168.0,"upb":1897852.98,"pred_cpr_pct":0.2311,"actual_cpr_pct":0.0,"residual":0.2311},{"loan_id":"3617VLR25_038039846670555","period":202412,"pool_cusip":"3617VLR25","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":41.0,"refi_incentive_bps":-143.0,"prepay_penalty_points":7.0,"sato_bps":222.0,"upb":300738.07,"pred_cpr_pct":0.2313,"actual_cpr_pct":0.0,"residual":0.2313},{"loan_id":"3617VLSA6_050001247062658","period":202412,"pool_cusip":"3617VLSA6","issuer_name":"BONNEVILLE MORTGAGE COMPANY, LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":39.0,"refi_incentive_bps":-158.0,"prepay_penalty_points":7.0,"sato_bps":207.0,"upb":1103261.45,"pred_cpr_pct":0.2319,"actual_cpr_pct":0.0,"residual":0.2319},{"loan_id":"3617LUBY3_022007632210208","period":202505,"pool_cusip":"3617LUBY3","issuer_name":"CHURCHILL MORTGAGE INVESTMENT LLC","fha_category":"538","loan_purpose":"538","affordable_status":"","loan_age_months":46.0,"refi_incentive_bps":-281.5,"prepay_penalty_points":8.0,"sato_bps":110.0,"upb":815220.65,"pred_cpr_pct":0.2321,"actual_cpr_pct":0.0,"residual":0.2321}]},"featureDist":{"refi_incentive_bps":{"edges":[-300.0,-276.667,-253.333,-230.0,-206.667,-183.333,-160.0,-136.667,-113.333,-90.0,-66.667,-43.333,-20.0,3.333,26.667,50.0,73.333,96.667,120.0,143.333,166.667,190.0,213.333,236.667,260.0,283.333,306.667,330.0,353.333,376.667,400.0],"counts":[42835,45405,49048,50822,51420,49317,48265,46970,45372,46695,47691,46022,47679,51820,53722,56040,54072,47493,40390,32289,24246,18275,13375,9166,6941,6170,4951,5096,5189,4921],"min":-553.5,"max":789.5,"mean":-74.33},"loan_age_months":{"edges":[0.0,12.0,24.0,36.0,48.0,60.0,72.0,84.0,96.0,108.0,120.0,132.0,144.0,156.0,168.0,180.0,192.0,204.0,216.0,228.0,240.0,252.0,264.0,276.0,288.0,300.0,312.0,324.0,336.0,348.0,360.0],"counts":[75243,87805,104869,114403,110837,97972,97637,95269,85261,70183,58917,49564,42437,31275,23288,20023,17814,16042,13139,9692,6750,4971,3120,1376,794,503,353,207,158,133],"min":0.0,"max":583.0,"mean":84.95},"prepay_penalty_points":{"edges":[0.0,0.909,1.818,2.727,3.636,4.545,5.455,6.364,7.273,8.182,9.091,10.0],"counts":[246220,75508,64750,76085,79569,84746,96754,116183,105675,98310,198158],"min":0.0,"max":10.0,"mean":5.06},"sato_bps":{"edges":[-200.0,-186.667,-173.333,-160.0,-146.667,-133.333,-120.0,-106.667,-93.333,-80.0,-66.667,-53.333,-40.0,-26.667,-13.333,0.0,13.333,26.667,40.0,53.333,66.667,80.0,93.333,106.667,120.0,133.333,146.667,160.0,173.333,186.667,200.0],"counts":[3648,3099,3590,6682,6778,9634,14033,17013,24911,46504,62743,86171,114987,122389,124277,127252,97565,70168,79014,44050,39353,28619,24611,14464,14519,9443,8033,4863,5003,3690],"min":-556.0,"max":592.0,"mean":-0.57},"upb_millions":{"edges":[0.0,2.667,5.333,8.0,10.667,13.333,16.0,18.667,21.333,24.0,26.667,29.333,32.0,34.667,37.333,40.0,42.667,45.333,48.0,50.667,53.333,56.0,58.667,61.333,64.0,66.667,69.333,72.0,74.667,77.333,80.0],"counts":[374996,259943,164403,109054,73872,56905,40926,32294,24662,17981,15967,12611,10858,8491,6829,5791,4827,3810,2976,2064,2181,1897,1464,1047,886,914,852,662,252,262],"min":0.0,"max":621.5,"mean":9.07},"months_to_maturity":{"edges":[0.0,16.0,32.0,48.0,64.0,80.0,96.0,112.0,128.0,144.0,160.0,176.0,192.0,208.0,224.0,240.0,256.0,272.0,288.0,304.0,320.0,336.0,352.0,368.0,384.0,400.0,416.0,432.0,448.0,464.0,480.0],"counts":[1776,1786,2395,3029,4391,6758,9756,12226,14817,17146,17729,19026,23356,27630,32248,38776,49339,56806,63927,72754,84788,91071,96399,108640,115385,111733,62127,38840,35259,21908],"min":0.0,"max":485.0,"mean":328.42},"months_post_lockout":{"edges":[0.0,2.0,4.0,6.0,8.0,10.0,12.0,14.0,16.0,18.0,20.0,22.0,24.0,26.0,28.0,30.0,32.0,34.0,36.0,38.0,40.0,42.0,44.0,46.0,48.0,50.0,52.0,54.0,56.0,58.0,60.0],"counts":[902683,1539,1559,1576,1608,1645,1697,1714,1725,1740,1756,1776,1788,1800,1811,1856,1942,2025,2140,2224,2260,2302,2350,2417,2421,2502,2785,3268,3924,281125],"min":0.0,"max":60.0,"mean":15.13}},"catCounts":{"fha_category":{"223f":469915,"232":314969,"221d4":210566,"223a7":137448,"538":82983,"OTHER":15947,"241":7585,"220":2545},"loan_purpose":{"RP":993062,"NC":149966,"538":82983,"OTHER":15947},"affordable_status":{"":628505,"MKT":482921,"BAF":104317,"AFF":26215}},"referenceLoan":{"loan_age_months":56.2,"refi_incentive_bps":-91.5,"prepay_penalty_points":6.45,"sato_bps":-11.1,"upb":8718425.0,"months_to_maturity":331.0,"months_post_lockout":55.4,"fha_category":"223f","loan_purpose":"RP","affordable_status":"MKT","in_lockout":0,"in_prepay_penalty":1,"pool_type":"PN","modified_ind":"N","non_level_ind":"N","mature_loan_flag":"N"},"plcHistory":{"201812":354.0,"201901":352.0,"201902":355.0,"201903":328.0,"201904":319.0,"201905":279.0,"201906":276.0,"201907":264.0,"201908":228.0,"201909":245.0,"201910":242.0,"201911":262.0,"201912":277.0,"202001":232.0,"202002":209.0,"202003":207.0,"202004":188.5,"202005":182.0,"202006":177.0,"202007":155.0,"202008":149.0,"202009":148.0,"202010":173.0,"202011":166.0,"202012":160.0,"202101":165.0,"202102":185.0,"202103":207.0,"202104":196.0,"202105":180.0,"202106":168.0,"202107":154.0,"202108":164.0,"202109":171.0,"202110":174.0,"202111":176.0,"202112":185.0,"202201":207.0,"202202":231.0,"202203":279.0,"202204":342.0,"202205":341.0,"202206":370.0,"202207":342.0,"202208":393.0,"202209":462.0,"202210":504.0,"202211":452.0,"202212":465.0,"202301":428.0,"202302":453.0,"202303":451.0,"202304":460.0,"202305":487.0,"202306":494.0,"202307":507.0,"202308":524.0,"202309":572.0,"202310":616.0,"202311":547.0,"202312":488.0,"202401":489.0,"202402":510.0,"202403":505.0,"202404":553.0,"202405":531.5,"202406":520.0,"202407":489.0,"202408":478.0,"202409":458.0,"202410":505.5,"202411":489.0,"202412":523.0,"202501":523.0,"202502":498.0,"202503":503.0,"202504":515.0,"202505":537.0,"202506":517.0,"202507":528.0,"202508":509.0,"202509":495.0,"202510":487.8,"202511":477.5,"202512":481.0,"202601":465.0,"202602":447.0,"202603":490.5},"vintageMedians":{"1990":4.52,"1991":3.785,"1992":3.78,"1994":3.58,"1995":4.22,"1996":3.6975,"1997":3.53,"1998":5.85,"1999":6.0,"2000":6.0,"2001":7.5,"2002":6.75,"2003":5.75,"2004":5.75,"2005":5.52,"2006":5.12,"2007":4.68,"2008":4.75,"2009":4.69,"2010":4.05,"2011":3.935,"2012":2.99,"2013":3.38,"2014":3.85,"2015":3.56,"2016":3.46,"2017":3.52,"2018":4.14,"2019":3.78,"2020":2.91,"2021":2.63,"2022":3.845,"2023":5.65,"2024":5.85,"2025":5.86,"2026":5.5},"sampleLoans":[{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.69,"upb":24499231.76,"origination_date":20251201,"loan_maturity_date":20610101,"lockout_end_date":null,"prepay_end_date":20360201.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.89,"upb":12467559.02,"origination_date":20250401,"loan_maturity_date":20600501,"lockout_end_date":null,"prepay_end_date":20350601.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.98,"upb":3566192.33,"origination_date":20240221,"loan_maturity_date":20590301,"lockout_end_date":null,"prepay_end_date":20340401.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":"MKT","pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.73,"upb":4785391.56,"origination_date":20250501,"loan_maturity_date":20600601,"lockout_end_date":null,"prepay_end_date":20350701.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.4,"upb":21113918.59,"origination_date":20250901,"loan_maturity_date":20601001,"lockout_end_date":null,"prepay_end_date":20351031.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.92,"upb":20435174.48,"origination_date":20250701,"loan_maturity_date":20600801,"lockout_end_date":20250901.0,"prepay_end_date":20350901.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(f)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.07,"upb":21410852.67,"origination_date":20240625,"loan_maturity_date":20590901,"lockout_end_date":null,"prepay_end_date":20341001.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":"MKT","pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.88,"upb":6297447.15,"origination_date":20250115,"loan_maturity_date":20550401,"lockout_end_date":null,"prepay_end_date":20350501.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(f)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null}],"selfTestFixture":[{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.69,"upb":24499231.76,"origination_date":20251201,"loan_maturity_date":20610101,"lockout_end_date":null,"prepay_end_date":20360201.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":3.0,"vintage_year":2025.0,"sato_bps":-13.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":-59.0,"fha_category":"232","loan_purpose":"RP","expected_predicted_CPR_pct":4.2462,"expected_total_logodds":-5.620632},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.89,"upb":12467559.02,"origination_date":20250401,"loan_maturity_date":20600501,"lockout_end_date":null,"prepay_end_date":20350601.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":11.0,"vintage_year":2025.0,"sato_bps":7.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":-39.0,"fha_category":"232","loan_purpose":"RP","expected_predicted_CPR_pct":3.4892,"expected_total_logodds":-5.821221},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.98,"upb":3566192.33,"origination_date":20240221,"loan_maturity_date":20590301,"lockout_end_date":null,"prepay_end_date":20340401.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":"MKT","pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":25.0,"vintage_year":2024.0,"sato_bps":20.0,"prepay_penalty_points":9.0,"plc_rate_bps":490.5,"refi_incentive_bps":-17.5,"fha_category":"223f","loan_purpose":"RP","expected_predicted_CPR_pct":6.6754,"expected_total_logodds":-5.154416},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.73,"upb":4785391.56,"origination_date":20250501,"loan_maturity_date":20600601,"lockout_end_date":null,"prepay_end_date":20350701.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":10.0,"vintage_year":2025.0,"sato_bps":-9.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":-55.0,"fha_category":"223f","loan_purpose":"RP","expected_predicted_CPR_pct":2.5309,"expected_total_logodds":-6.14763},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.4,"upb":21113918.59,"origination_date":20250901,"loan_maturity_date":20601001,"lockout_end_date":null,"prepay_end_date":20351031.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":6.0,"vintage_year":2025.0,"sato_bps":-42.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":-88.0,"fha_category":"232","loan_purpose":"RP","expected_predicted_CPR_pct":3.1978,"expected_total_logodds":-5.910054},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.92,"upb":20435174.48,"origination_date":20250701,"loan_maturity_date":20600801,"lockout_end_date":20250901.0,"prepay_end_date":20350901.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(f)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":8.0,"vintage_year":2025.0,"sato_bps":10.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":-36.0,"fha_category":"223f","loan_purpose":"RP","expected_predicted_CPR_pct":6.1994,"expected_total_logodds":-5.23113},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.07,"upb":21410852.67,"origination_date":20240625,"loan_maturity_date":20590901,"lockout_end_date":null,"prepay_end_date":20341001.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":"MKT","pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":21.0,"vintage_year":2024.0,"sato_bps":-71.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":-121.0,"fha_category":"223f","loan_purpose":"RP","expected_predicted_CPR_pct":8.0674,"expected_total_logodds":-4.956977},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.88,"upb":6297447.15,"origination_date":20250115,"loan_maturity_date":20550401,"lockout_end_date":null,"prepay_end_date":20350501.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(f)","affordable_status":null,"pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":14.0,"vintage_year":2025.0,"sato_bps":6.0,"prepay_penalty_points":0.0,"plc_rate_bps":490.5,"refi_incentive_bps":85.0,"fha_category":"232","loan_purpose":"RP","expected_predicted_CPR_pct":6.1154,"expected_total_logodds":-5.245242},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":5.42,"upb":62488943.54,"origination_date":20230228,"loan_maturity_date":20580301,"lockout_end_date":null,"prepay_end_date":20330401.0,"prepay_premium_period_yrs":10,"fha_program_code":"207/223(F)","affordable_status":"BAF","pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":37.0,"vintage_year":2023.0,"sato_bps":-16.5,"prepay_penalty_points":8.0,"plc_rate_bps":490.5,"refi_incentive_bps":-61.0,"fha_category":"223f","loan_purpose":"RP","expected_predicted_CPR_pct":7.6476,"expected_total_logodds":-5.012851},{"deal_id":"GNR_2024_NEW","period":202603,"loan_rate":6.69,"upb":15740254.08,"origination_date":20240501,"loan_maturity_date":20590601,"lockout_end_date":null,"prepay_end_date":20340701.0,"prepay_premium_period_yrs":10,"fha_program_code":"232/223(F)","affordable_status":"MKT","pool_type":"PN","modified_ind":null,"non_level_ind":null,"mature_loan_flag":null,"loan_age_months":22.0,"vintage_year":2024.0,"sato_bps":91.0,"prepay_penalty_points":10.0,"plc_rate_bps":490.5,"refi_incentive_bps":41.0,"fha_category":"232","loan_purpose":"RP","expected_predicted_CPR_pct":19.7408,"expected_total_logodds":-3.99027}]};

// ─────────────────────────────────────────────────────────────────
//  Helpers — JS port of model/predict_python.py
// ─────────────────────────────────────────────────────────────────

function toYYYYMM(v) {
  if (v === null || v === undefined || v === "") return "";
  let s = String(v).trim();
  if (s === "" || s === "nan" || s === "None") return "";
  if (/^-?\d+(\.\d+)?$/.test(s)) s = String(Math.trunc(Number(s)));
  return s.length >= 6 ? s.slice(0, 6) : "";
}

function monthsDiff(a, b) {
  if (!a || !b) return null;
  const ay = parseInt(a.slice(0, 4), 10);
  const am = parseInt(a.slice(4, 6), 10);
  const by = parseInt(b.slice(0, 4), 10);
  const bm = parseInt(b.slice(4, 6), 10);
  if ([ay, am, by, bm].some((x) => Number.isNaN(x))) return null;
  return (ay - by) * 12 + (am - bm);
}

function fhaClassify(code) {
  const c = String(code ?? "").trim().toUpperCase().replace(/ /g, "");
  if (!c) return ["OTHER", "OTHER"];
  const rules = [
    ["538", "538", "538"],
    ["232", "232", "NC"],
    ["223(F)", "223f", "RP"],
    ["223F", "223f", "RP"],
    ["223(A)", "223a7", "RP"],
    ["223A", "223a7", "RP"],
    ["221(D)", "221d4", "NC"],
    ["221D", "221d4", "NC"],
    ["220", "220", "NC"],
    ["241", "241", "NC"],
  ];
  for (const [s, cat, purp] of rules) {
    if (c.includes(s)) return [cat, purp];
  }
  return ["OTHER", "OTHER"];
}

function piecewise(value, knots, linParam, knotPrefix, coefs) {
  let s = coefs[linParam] * value;
  for (const k of knots) {
    const kname = `${knotPrefix}${Number.isInteger(k) ? k : k}`;
    s += coefs[kname] * Math.max(value - k, 0);
  }
  return s;
}

const COMPONENT_KEYS = [
  "REFI", "AGE", "PEN", "SATO", "SIZE", "M2M", "MPL",
  "INTERACT", "PHASE", "FHA", "PURPOSE", "AFF", "POOL",
];

const COMPONENT_COLORS = {
  REFI:     "#2563eb",
  AGE:      "#16a34a",
  PEN:      "#dc2626",
  SATO:     "#9333ea",
  SIZE:     "#ea580c",
  M2M:      "#0891b2",
  MPL:      "#65a30d",
  INTERACT: "#a855f7",
  PHASE:    "#475569",
  FHA:      "#f59e0b",
  PURPOSE:  "#84cc16",
  AFF:      "#ec4899",
  POOL:     "#94a3b8",
};

const fmtPct = (v, d = 2) =>
  v === null || v === undefined || Number.isNaN(v) ? "—" : `${v.toFixed(d)}%`;
const fmtNum = (v, d = 2) =>
  v === null || v === undefined || Number.isNaN(v) ? "—" : v.toFixed(d);
const fmtInt = (v) =>
  v === null || v === undefined || Number.isNaN(v)
    ? "—"
    : Math.round(v).toLocaleString();
const fmt$M = (v) =>
  v === null || v === undefined || Number.isNaN(v)
    ? "—"
    : `$${(v / 1e6).toFixed(2)}M`;

function predict(rawLoan, modelData) {
  const META = modelData.meta;
  const COEFS = modelData.coefficients;
  const INTERCEPT = COEFS["__intercept__"];
  const PLC = modelData.plcHistory;
  const VINT = modelData.vintageMedians;
  const r = rawLoan || {};

  const period = toYYYYMM(r.period);
  const lockoutEnd = toYYYYMM(r.lockout_end_date);
  const prepayEnd = toYYYYMM(r.prepay_end_date);
  const inLockout = lockoutEnd && period < lockoutEnd ? 1 : 0;
  const inPenalty = prepayEnd && period < prepayEnd ? 1 : 0;

  // ── age ─────────────────────────────────────────────────────────
  let age =
    r.loan_age_months ?? r.loan_age_months_input ?? null;
  if (age === null || age === "" || Number.isNaN(Number(age))) {
    const orig = toYYYYMM(r.origination_date);
    const d = monthsDiff(period, orig);
    age = d === null ? 0 : Math.max(0, d);
  }
  age = Number(age);

  // ── m2m ─────────────────────────────────────────────────────────
  const mat = toYYYYMM(r.loan_maturity_date);
  const m2mRaw = monthsDiff(mat, period);
  const m2m = m2mRaw === null ? 120 : Math.max(0, Math.min(600, m2mRaw));

  // ── mpl ─────────────────────────────────────────────────────────
  const mplRaw = lockoutEnd ? monthsDiff(period, lockoutEnd) : null;
  const mpl = mplRaw === null ? 0 : Math.max(0, Math.min(60, mplRaw));

  // ── vintage ─────────────────────────────────────────────────────
  let vintage =
    r.vintage_year ?? r.vintage_year_input ?? null;
  if (vintage === null || vintage === "" || Number.isNaN(Number(vintage))) {
    const orig = toYYYYMM(r.origination_date);
    if (orig.length >= 4) {
      const v = parseInt(orig.slice(0, 4), 10);
      vintage = Number.isNaN(v) ? null : v;
    } else {
      vintage = null;
    }
  } else {
    vintage = Number(vintage);
  }

  // ── PLC ─────────────────────────────────────────────────────────
  let plc = r.plc_rate_bps ?? r.plc_rate_bps_input ?? null;
  if (plc === null || plc === "" || Number.isNaN(Number(plc))) {
    plc = period && PLC[parseInt(period, 10)] !== undefined
      ? PLC[parseInt(period, 10)]
      : 0;
  }
  plc = Number(plc);

  // ── pen ─────────────────────────────────────────────────────────
  let pen =
    r.prepay_penalty_points ?? r.prepay_penalty_points_input ?? null;
  if (pen === null || pen === "" || Number.isNaN(Number(pen))) {
    if (inPenalty) {
      const mr = monthsDiff(prepayEnd, period);
      pen = mr === null ? 0 : Math.max(0, Math.min(10, mr / 12));
    } else {
      pen = 0;
    }
  }
  pen = Number(pen);

  // ── SATO ────────────────────────────────────────────────────────
  let sato = r.sato_bps ?? r.sato_bps_input ?? null;
  if (sato === null || sato === "" || Number.isNaN(Number(sato))) {
    const loanRate = r.loan_rate ?? r.loan_rate_pct ?? null;
    const med = vintage !== null && VINT[vintage] !== undefined ? VINT[vintage] : null;
    if (loanRate !== null && med !== null) {
      sato = (Number(loanRate) - Number(med)) * 100;
    } else {
      sato = 0;
    }
  }
  sato = Number(sato);

  // ── refi inc ────────────────────────────────────────────────────
  let refi = r.refi_incentive_bps ?? null;
  if (refi === null || refi === "" || Number.isNaN(Number(refi))) {
    const loanRate = r.loan_rate ?? r.loan_rate_pct ?? null;
    if (loanRate !== null && loanRate !== "") {
      refi = Number(loanRate) * 100 - (plc + (1 + pen) * 12.5);
    } else {
      refi = 0;
    }
  }
  refi = Number(refi);

  // ── upb ─────────────────────────────────────────────────────────
  const upb = Number(r.upb || 0);
  const upbM = Math.min(upb / 1_000_000, 100);

  // ── FHA / purpose ───────────────────────────────────────────────
  let fhaCat, purpose;
  if (r.fha_program_code) {
    [fhaCat, purpose] = fhaClassify(r.fha_program_code);
  } else {
    fhaCat = r.fha_category || "OTHER";
    purpose = r.loan_purpose || "OTHER";
  }

  const isNc = purpose === "NC" ? 1 : 0;
  const fha221d4 = fhaCat === "221d4" ? 1 : 0;
  const fha223a7 = fhaCat === "223a7" ? 1 : 0;
  const fha232 = fhaCat === "232" ? 1 : 0;
  const fha538 = fhaCat === "538" ? 1 : 0;
  const fha241 = fhaCat === "241" ? 1 : 0;
  const fha220 = fhaCat === "220" ? 1 : 0;
  const fhaOther = fhaCat === "OTHER" ? 1 : 0;

  const aff = String(r.affordable_status || "").toUpperCase().trim();
  const affAff = aff === "AFF" ? 1 : 0;
  const affBaf = aff === "BAF" ? 1 : 0;
  const affMkt = aff === "MKT" ? 1 : 0;

  // Pool-type-derived flags. Legacy modified_ind/non_level_ind/
  // mature_loan_flag are blank in modern panel; pool_type carries
  // the live signal (LM=Modified/Mature, PN=Non-Level, etc.).
  const poolType = String(r.pool_type || "").toUpperCase().trim();
  const isLm = poolType === "LM" ? 1 : 0;
  const isPn = poolType === "PN" ? 1 : 0;
  const isLs = poolType === "LS" ? 1 : 0;
  const isRx = poolType === "RX" ? 1 : 0;

  // ── Component log-odds ───────────────────────────────────────────
  const refiLo = piecewise(refi, META.knots.refi, "refi_lin", "refi_k", COEFS);
  const ageLo = piecewise(age, META.knots.age, "age_lin", "age_k", COEFS);
  const penLo = piecewise(pen, META.knots.pen, "pen_lin", "pen_k", COEFS);
  const satoLo = piecewise(sato, META.knots.sato, "sato_lin", "sato_k", COEFS);
  const sizeLo = piecewise(upbM, META.knots.size, "size_lin", "size_k", COEFS);
  const m2mLo = piecewise(m2m, META.knots.m2m, "m2m_lin", "m2m_k", COEFS);
  const mplLo = piecewise(mpl, META.knots.mpl, "mpl_lin", "mpl_k", COEFS);
  const interLo =
    (COEFS["refi_x_pen"] *
      Math.max(refi, 0) *
      Math.min(Math.max(pen, 0), 10)) /
    100;
  const phaseLo = COEFS["in_penalty"] * inPenalty;
  const fhaLo =
    COEFS["fha_221d4"] * fha221d4 +
    COEFS["fha_223a7"] * fha223a7 +
    COEFS["fha_232"] * fha232 +
    COEFS["fha_538"] * fha538 +
    COEFS["fha_241"] * fha241 +
    COEFS["fha_220"] * fha220 +
    COEFS["fha_other"] * fhaOther;
  const purpLo = COEFS["is_nc"] * isNc;
  const affLo =
    COEFS["aff_aff"] * affAff +
    COEFS["aff_baf"] * affBaf +
    COEFS["aff_mkt"] * affMkt;
  const poolLo =
    COEFS["is_lm_pool"] * isLm +
    COEFS["is_pn_pool"] * isPn +
    COEFS["is_ls_pool"] * isLs +
    COEFS["is_rx_pool"] * isRx;

  const components = {
    REFI: refiLo,
    AGE: ageLo,
    PEN: penLo,
    SATO: satoLo,
    SIZE: sizeLo,
    M2M: m2mLo,
    MPL: mplLo,
    INTERACT: interLo,
    PHASE: phaseLo,
    FHA: fhaLo,
    PURPOSE: purpLo,
    AFF: affLo,
    POOL: poolLo,
  };

  const totalLo =
    INTERCEPT + Object.values(components).reduce((a, b) => a + b, 0);

  const smm = inLockout ? 0 : 1 / (1 + Math.exp(-totalLo));
  const cprPct = (1 - Math.pow(1 - smm, 12)) * 100;

  // Per-component CPR attribution
  const attr = {};
  for (const k of COMPONENT_KEYS) {
    if (inLockout) {
      attr[k] = 0;
    } else {
      const wo = totalLo - components[k];
      const smmWo = 1 / (1 + Math.exp(-wo));
      const cprWo = (1 - Math.pow(1 - smmWo, 12)) * 100;
      attr[k] = cprPct - cprWo;
    }
  }

  const baselineSmm = 1 / (1 + Math.exp(-INTERCEPT));
  const baselineCpr = (1 - Math.pow(1 - baselineSmm, 12)) * 100;

  return {
    derived: {
      in_lockout: inLockout,
      in_prepay_penalty: inPenalty,
      loan_age_months: age,
      months_to_maturity: m2m,
      months_post_lockout: mpl,
      vintage_year: vintage,
      sato_bps: sato,
      plc_rate_bps: plc,
      prepay_penalty_points: pen,
      refi_incentive_bps: refi,
      upb_millions: upbM,
      fha_category: fhaCat,
      loan_purpose: purpose,
      affordable_status: aff,
    },
    components,
    total_logodds: totalLo,
    smm,
    cpr_pct: cprPct,
    baseline_cpr_pct: baselineCpr,
    attributions: attr,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Self-test — runs once on mount
// ─────────────────────────────────────────────────────────────────
function runSelfTest() {
  const out = { pass: 0, fail: 0, errors: [] };
  for (const f of MODEL_DATA.selfTestFixture) {
    const got = predict(f, MODEL_DATA);
    const diff = Math.abs(got.cpr_pct - f.expected_predicted_CPR_pct);
    if (diff <= 0.05) out.pass++;
    else {
      out.fail++;
      out.errors.push({
        deal: f.deal_id,
        period: f.period,
        expected: f.expected_predicted_CPR_pct,
        got: got.cpr_pct,
        diff,
      });
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────
//  Reusable UI primitives
// ─────────────────────────────────────────────────────────────────

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4 ${className}`}>
    {title && <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>}
    {children}
  </div>
);

const Stat = ({ label, value, hint }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-3">
    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-2xl font-semibold mt-1 text-slate-900">{value}</div>
    {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
  </div>
);

const NumInput = ({ value, onChange, step = 1, className = "" }) => (
  <input
    type="number"
    value={value ?? ""}
    step={step}
    onChange={(e) =>
      onChange(e.target.value === "" ? null : parseFloat(e.target.value))
    }
    className={`w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const TextInput = ({ value, onChange, className = "" }) => (
  <input
    type="text"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Select = ({ value, onChange, options, className = "" }) => (
  <select
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
  >
    {options.map((o) =>
      typeof o === "string" ? (
        <option key={o} value={o}>{o}</option>
      ) : (
        <option key={o.value} value={o.value}>{o.label}</option>
      )
    )}
  </select>
);

// ─────────────────────────────────────────────────────────────────
//  Header + tab nav
// ─────────────────────────────────────────────────────────────────

function Header({ meta, selfTest }) {
  const banner =
    selfTest.fail > 0
      ? { color: "bg-red-100 text-red-800 border-red-300", text: `Self-test FAILED: ${selfTest.fail}/${selfTest.fail + selfTest.pass} fixture rows diverged from Python reference (>0.05 pp).` }
      : { color: "bg-emerald-50 text-emerald-800 border-emerald-200", text: `Self-test passed: ${selfTest.pass}/${selfTest.pass + selfTest.fail} fixture rows match Python reference within 0.05 pp.` };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              GNPL Voluntary Prepayment Model — Explorer
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Train {meta.train_period_min} → {meta.train_period_max}
              {"  ·  "}
              Test {meta.test_period_min} → {meta.test_period_max}
              {"  ·  "}
              {fmtInt(meta.train_n)} train obs / {fmtInt(meta.test_n)} test obs
            </div>
          </div>
          <div className={`text-xs border rounded px-2 py-1 ${banner.color}`}>
            {banner.text}
          </div>
        </div>
      </div>
    </header>
  );
}

const TABS = [
  { id: "performance",    label: "Model Performance" },
  { id: "historical_fit", label: "Historical Fit" },
  { id: "scurve",         label: "S-Curves" },
  { id: "outliers",       label: "Outliers" },
  { id: "projector",      label: "Loan Projector" },
  { id: "feature_dist",   label: "Feature Distributions" },
];

function TabNav({ active, onChange }) {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition ${
              active === t.id
                ? "border-blue-600 text-blue-700 font-medium"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Performance panel
// ─────────────────────────────────────────────────────────────────

function PerformancePanel() {
  const m = MODEL_DATA.meta;
  const calib = MODEL_DATA.calibration;
  const segs = MODEL_DATA.segments;

  const segByField = useMemo(() => {
    const out = {};
    for (const s of segs) {
      if (!out[s.segment_field]) out[s.segment_field] = [];
      out[s.segment_field].push(s);
    }
    return out;
  }, [segs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Train AUC" value={m.train_auc.toFixed(3)} hint={`${fmtInt(m.train_events)} events / ${fmtInt(m.train_n)} obs`} />
        <Stat label="Test AUC" value={m.test_auc.toFixed(3)} hint={`${fmtInt(m.test_events)} events / ${fmtInt(m.test_n)} obs`} />
        <Stat label="Train pred / actual CPR" value={`${m.train_pred_cpr_pct.toFixed(2)}% / ${m.train_actual_cpr_pct.toFixed(2)}%`} hint="Unweighted SMM mean → CPR" />
        <Stat label="Test pred / actual CPR" value={`${m.test_pred_cpr_pct.toFixed(2)}% / ${m.test_actual_cpr_pct.toFixed(2)}%`} hint="Model over-predicts in 2024-2026" />
      </div>

      <Card title="Decile calibration (test set, sorted by predicted SMM)">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={calib} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="decile" tickFormatter={(d) => `D${d + 1}`} />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${(+v).toFixed(2)}%`} />
            <Legend />
            <Bar dataKey="pred_cpr" name="Predicted CPR" fill="#3b82f6" />
            <Bar dataKey="actual_cpr" name="Actual CPR" fill="#0f172a" />
            <Line dataKey="actual_cpr" stroke="#dc2626" dot={false} legendType="none" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="text-xs text-slate-500 mt-2">
          Bars: predicted vs actual CPR per test-set predicted-SMM decile. The
          right tail (deciles 8-9) is where the 2024-2026 over-prediction
          concentrates: pred ≈ 13% but actual ≈ 3%.
        </div>
      </Card>

      {Object.entries(segByField).map(([field, rows]) => (
        <Card key={field} title={`Segment validation — ${field}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="py-2 pr-3">Value</th>
                  <th className="py-2 pr-3 text-right">N obs</th>
                  <th className="py-2 pr-3 text-right">UPB ($M)</th>
                  <th className="py-2 pr-3 text-right">Pred CPR</th>
                  <th className="py-2 pr-3 text-right">Actual CPR</th>
                  <th className="py-2 pr-3 text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const d = r.pred_cpr - r.actual_cpr;
                  return (
                    <tr key={`${field}-${r.segment_value}`} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-mono">{r.segment_value || "(blank)"}</td>
                      <td className="py-2 pr-3 text-right">{fmtInt(r.n)}</td>
                      <td className="py-2 pr-3 text-right">{r.upb_mn.toFixed(0)}</td>
                      <td className="py-2 pr-3 text-right">{r.pred_cpr.toFixed(2)}%</td>
                      <td className="py-2 pr-3 text-right">{r.actual_cpr.toFixed(2)}%</td>
                      <td className={`py-2 pr-3 text-right font-medium ${Math.abs(d) > 1.5 ? "text-red-600" : "text-slate-600"}`}>
                        {d >= 0 ? "+" : ""}{d.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Historical fit panel
// ─────────────────────────────────────────────────────────────────

function HistoricalFitPanel() {
  const [overlay, setOverlay] = useState("overall");
  const overall = MODEL_DATA.monthlyOverall;
  const byCat = MODEL_DATA.monthlyByCat;

  const data = useMemo(() => {
    if (overlay === "overall") return overall;
    const cat = byCat[overlay] || [];
    return cat;
  }, [overlay, overall, byCat]);

  const trainBoundary = 202407;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-slate-700">Series:</label>
        <Select
          value={overlay}
          onChange={setOverlay}
          options={[
            { value: "overall", label: "Overall" },
            ...Object.keys(byCat).map((c) => ({ value: c, label: `FHA ${c}` })),
          ]}
          className="w-48"
        />
        <span className="text-xs text-slate-500 ml-auto">
          UPB-weighted SMM → CPR per month. Shaded band = test period.
        </span>
      </div>
      <Card>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={(p) => `${String(p).slice(0, 4)}-${String(p).slice(4, 6)}`} />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip
              labelFormatter={(p) => `Period ${p}`}
              formatter={(v) => `${(+v).toFixed(2)}%`}
            />
            <Legend />
            <ReferenceArea x1={trainBoundary} x2={data[data.length - 1]?.period} fill="#fef2f2" fillOpacity={0.6} />
            <Line type="monotone" dataKey="actual_cpr" name="Actual CPR" stroke="#0f172a" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="pred_cpr" name="Predicted CPR" stroke="#3b82f6" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-slate-500 mt-2">
          Test period (≥ {trainBoundary}) is shaded. The model tracks
          actual prepayments well through 2023 but consistently over-predicts
          in 2024-2026 — the rate-shock regime didn't drive the prepayment
          response the historical training data implied.
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  S-curve panel
// ─────────────────────────────────────────────────────────────────

const SCURVE_FEATURES = [
  { key: "refi_incentive_bps",    label: "Refi incentive (bps)",  range: [-300, 400], step: 10  },
  { key: "loan_age_months",       label: "Loan age (months)",     range: [0,    360], step: 6   },
  { key: "prepay_penalty_points", label: "Penalty points",        range: [0,    10],  step: 0.25 },
  { key: "sato_bps",              label: "SATO (bps)",            range: [-200, 200], step: 5   },
  { key: "upb_millions",          label: "Loan size ($M)",        range: [0,    80],  step: 1   },
  { key: "months_to_maturity",    label: "Months-to-maturity",    range: [0,    480], step: 6   },
  { key: "months_post_lockout",   label: "Months post-lockout",   range: [0,    60],  step: 1   },
];

function SCurveCard({ feature, reference }) {
  const data = useMemo(() => {
    const points = [];
    const [lo, hi] = feature.range;
    for (let v = lo; v <= hi + feature.step / 2; v += feature.step) {
      const loan = { ...reference };
      if (feature.key === "upb_millions") {
        loan.upb = v * 1_000_000;
      } else {
        loan[feature.key] = v;
      }
      // ensure raw-loan derivation is bypassed for derived features
      const out = predict(loan, MODEL_DATA);
      points.push({ x: +v.toFixed(3), cpr: +out.cpr_pct.toFixed(4) });
    }
    return points;
  }, [feature, reference]);

  const refValue =
    feature.key === "upb_millions"
      ? (reference.upb || 0) / 1_000_000
      : reference[feature.key];

  const refOut = useMemo(() => predict(reference, MODEL_DATA), [reference]);

  return (
    <Card title={feature.label}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(v) => `${(+v).toFixed(2)}%`}
            labelFormatter={(x) => `${feature.label.split(" (")[0]} = ${x}`}
          />
          <ReferenceLine x={refValue} stroke="#dc2626" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="cpr" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-slate-500 mt-1">
        Reference {feature.label.split(" (")[0]} = <b>{refValue?.toFixed(1) ?? "—"}</b>;
        predicted CPR at reference = <b>{refOut.cpr_pct.toFixed(2)}%</b>
      </div>
    </Card>
  );
}

function ReferenceLoanEditor({ reference, setReference }) {
  const upd = (k, v) => setReference({ ...reference, [k]: v });
  const fhaOpts = ["223f", "232", "221d4", "223a7", "538", "241", "220", "OTHER"];
  const purpOpts = ["RP", "NC", "538", "OTHER"];
  const affOpts = ["MKT", "AFF", "BAF", ""];
  return (
    <Card title="Reference loan (others held constant while sweeping each feature)">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">Refi incentive (bps)</div>
          <NumInput value={reference.refi_incentive_bps} onChange={(v) => upd("refi_incentive_bps", v)} step={10} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Loan age (months)</div>
          <NumInput value={reference.loan_age_months} onChange={(v) => upd("loan_age_months", v)} step={1} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Penalty points</div>
          <NumInput value={reference.prepay_penalty_points} onChange={(v) => upd("prepay_penalty_points", v)} step={0.5} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">SATO (bps)</div>
          <NumInput value={reference.sato_bps} onChange={(v) => upd("sato_bps", v)} step={5} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">UPB ($)</div>
          <NumInput value={reference.upb} onChange={(v) => upd("upb", v)} step={1_000_000} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Months-to-maturity</div>
          <NumInput value={reference.months_to_maturity} onChange={(v) => upd("months_to_maturity", v)} step={6} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Months post-lockout</div>
          <NumInput value={reference.months_post_lockout} onChange={(v) => upd("months_post_lockout", v)} step={1} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">In penalty?</div>
          <Select
            value={String(reference.in_prepay_penalty)}
            onChange={(v) => upd("in_prepay_penalty", parseInt(v, 10))}
            options={[{ value: "0", label: "No" }, { value: "1", label: "Yes" }]}
          />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">FHA category</div>
          <Select value={reference.fha_category} onChange={(v) => upd("fha_category", v)} options={fhaOpts} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Loan purpose</div>
          <Select value={reference.loan_purpose} onChange={(v) => upd("loan_purpose", v)} options={purpOpts} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Affordable status</div>
          <Select value={reference.affordable_status} onChange={(v) => upd("affordable_status", v)} options={affOpts} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">In lockout?</div>
          <Select
            value={String(reference.in_lockout)}
            onChange={(v) => upd("in_lockout", parseInt(v, 10))}
            options={[{ value: "0", label: "No" }, { value: "1", label: "Yes" }]}
          />
        </div>
      </div>
    </Card>
  );
}

function SCurvePanel({ reference, setReference }) {
  return (
    <div className="space-y-4">
      <ReferenceLoanEditor reference={reference} setReference={setReference} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SCURVE_FEATURES.map((f) => (
          <SCurveCard key={f.key} feature={f} reference={reference} />
        ))}
      </div>
      <Card title="What you're seeing">
        <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
          <li><b>Refi incentive</b>: monotone-rising response saturates above ~150 bps. Strongest economic driver.</li>
          <li><b>Loan age</b>: weak rise in early years, plateau, then sharp ramp after 180 months as loans approach maturity.</li>
          <li><b>Penalty points</b>: large negative coefficient + interaction with refi incentive — the model dampens prepayments hard while the penalty is high.</li>
          <li><b>SATO</b>: borrowers with above-market origination rates show modestly elevated baseline prepayment.</li>
          <li><b>Loan size</b>: U-shape — small loans and very large loans prepay more than mid-sized ones.</li>
          <li><b>Months post-lockout</b>: gentle increase; the burnout effect.</li>
        </ul>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Outliers panel
// ─────────────────────────────────────────────────────────────────

const OUTLIER_FILTERS = [
  { id: "over_pred",  label: "Most over-predicted", desc: "Largest pred − actual gap (model said yes, loan stayed)" },
  { id: "under_pred", label: "Most under-predicted", desc: "Largest actual − pred gap (model missed a prepay)" },
  { id: "high_pred",  label: "Highest predicted CPR", desc: "Top-50 absolute predicted CPR" },
  { id: "low_pred",   label: "Lowest predicted CPR", desc: "Bottom-50 absolute predicted CPR" },
];

function OutliersPanel() {
  const [filter, setFilter] = useState("over_pred");
  const [sortKey, setSortKey] = useState("residual");
  const [sortDir, setSortDir] = useState("desc");
  const [expanded, setExpanded] = useState(null);

  const rows = useMemo(() => {
    const r = [...MODEL_DATA.outliers[filter]];
    r.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "string") {
        return sortDir === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return r;
  }, [filter, sortKey, sortDir]);

  const headerClick = (k) => {
    if (k === sortKey) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const Th = ({ k, children, right }) => (
    <th
      onClick={() => headerClick(k)}
      className={`py-2 px-2 cursor-pointer hover:bg-slate-100 select-none ${right ? "text-right" : "text-left"}`}
    >
      {children}
      {sortKey === k && <span className="text-xs ml-1">{sortDir === "desc" ? "▼" : "▲"}</span>}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {OUTLIER_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setExpanded(null); }}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${
              filter === f.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-slate-500">{OUTLIER_FILTERS.find((x) => x.id === filter)?.desc}</div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b-2 border-slate-200 bg-slate-50">
              <tr className="text-slate-600">
                <Th k="period">Period</Th>
                <Th k="loan_id">Loan ID</Th>
                <Th k="fha_category">FHA</Th>
                <Th k="loan_purpose">Purp</Th>
                <Th k="loan_age_months" right>Age</Th>
                <Th k="refi_incentive_bps" right>Refi</Th>
                <Th k="prepay_penalty_points" right>Pen</Th>
                <Th k="sato_bps" right>SATO</Th>
                <Th k="upb" right>UPB ($M)</Th>
                <Th k="pred_cpr_pct" right>Pred CPR</Th>
                <Th k="actual_cpr_pct" right>Actual</Th>
                <Th k="residual" right>Resid</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isExp = expanded === i;
                return (
                  <React.Fragment key={i}>
                    <tr
                      onClick={() => setExpanded(isExp ? null : i)}
                      className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50 ${isExp ? "bg-blue-50" : ""}`}
                    >
                      <td className="py-1.5 px-2 font-mono">{r.period}</td>
                      <td className="py-1.5 px-2 font-mono truncate max-w-[160px]" title={r.loan_id}>{r.loan_id}</td>
                      <td className="py-1.5 px-2">{r.fha_category}</td>
                      <td className="py-1.5 px-2">{r.loan_purpose}</td>
                      <td className="py-1.5 px-2 text-right">{fmtNum(r.loan_age_months, 0)}</td>
                      <td className="py-1.5 px-2 text-right">{fmtNum(r.refi_incentive_bps, 0)}</td>
                      <td className="py-1.5 px-2 text-right">{fmtNum(r.prepay_penalty_points, 1)}</td>
                      <td className="py-1.5 px-2 text-right">{fmtNum(r.sato_bps, 0)}</td>
                      <td className="py-1.5 px-2 text-right">{r.upb ? (r.upb / 1e6).toFixed(1) : "—"}</td>
                      <td className="py-1.5 px-2 text-right font-medium text-blue-700">{fmtNum(r.pred_cpr_pct, 2)}%</td>
                      <td className="py-1.5 px-2 text-right">{fmtNum(r.actual_cpr_pct, 2)}%</td>
                      <td className={`py-1.5 px-2 text-right font-medium ${r.residual > 0 ? "text-red-600" : "text-emerald-700"}`}>
                        {r.residual >= 0 ? "+" : ""}{fmtNum(r.residual, 2)}
                      </td>
                    </tr>
                    {isExp && <OutlierAttribution loan={r} />}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function OutlierAttribution({ loan }) {
  const out = useMemo(() => {
    const synth = {
      period: loan.period,
      loan_age_months: loan.loan_age_months,
      refi_incentive_bps: loan.refi_incentive_bps,
      prepay_penalty_points: loan.prepay_penalty_points,
      sato_bps: loan.sato_bps,
      upb: loan.upb,
      fha_category: loan.fha_category,
      loan_purpose: loan.loan_purpose,
      affordable_status: loan.affordable_status,
      in_prepay_penalty: 1,
    };
    return predict(synth, MODEL_DATA);
  }, [loan]);

  const data = COMPONENT_KEYS
    .map((k) => ({ k, v: +out.attributions[k].toFixed(3) }))
    .filter((d) => Math.abs(d.v) > 0.01)
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v));

  return (
    <tr className="bg-blue-50 border-b border-slate-200">
      <td colSpan={12} className="px-3 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Predicted CPR breakdown</div>
            <ResponsiveContainer width="100%" height={Math.max(180, data.length * 22 + 40)}>
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${v}pp`} />
                <YAxis type="category" dataKey="k" width={80} />
                <Tooltip formatter={(v) => `${(+v).toFixed(2)} pp`} />
                <Bar dataKey="v">
                  {data.map((d) => (
                    <Cell key={d.k} fill={d.v >= 0 ? "#3b82f6" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            <div className="font-semibold mb-1">Loan summary</div>
            <div>FHA cat: <b>{loan.fha_category}</b> · Purpose: <b>{loan.loan_purpose}</b> · Aff: <b>{loan.affordable_status || "(blank)"}</b></div>
            <div>Age: <b>{fmtNum(loan.loan_age_months, 0)}</b> months · UPB: <b>{fmt$M(loan.upb)}</b> · Period: <b>{loan.period}</b></div>
            <div>Refi inc: <b>{fmtNum(loan.refi_incentive_bps, 0)} bps</b> · Penalty: <b>{fmtNum(loan.prepay_penalty_points, 1)} pts</b> · SATO: <b>{fmtNum(loan.sato_bps, 0)} bps</b></div>
            <div className="pt-2 border-t border-slate-300 mt-2">
              <div>Baseline (intercept-only) CPR: <b>{out.baseline_cpr_pct.toFixed(3)}%</b></div>
              <div>Predicted CPR: <b className="text-blue-700">{out.cpr_pct.toFixed(2)}%</b></div>
              <div>Actual outcome: <b className={loan.actual_cpr_pct > 0 ? "text-emerald-700" : "text-slate-700"}>{loan.actual_cpr_pct > 0 ? "PREPAID" : "did not prepay"}</b></div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Loan Projector panel
// ─────────────────────────────────────────────────────────────────

const PROJ_COLS = [
  { key: "deal_id",                   label: "Deal ID",     w: 110, type: "text" },
  { key: "period",                    label: "Period",      w: 70,  type: "text" },
  { key: "loan_rate",                 label: "Rate %",      w: 70,  type: "num", step: 0.01 },
  { key: "upb",                       label: "UPB $",       w: 110, type: "num", step: 100000 },
  { key: "origination_date",          label: "Orig Date",   w: 90,  type: "text" },
  { key: "loan_maturity_date",        label: "Maturity",    w: 90,  type: "text" },
  { key: "lockout_end_date",          label: "Lockout End", w: 95,  type: "text" },
  { key: "prepay_end_date",           label: "Penalty End", w: 95,  type: "text" },
  { key: "fha_program_code",          label: "FHA Code",    w: 100, type: "text" },
  { key: "affordable_status",         label: "Aff",         w: 60,  type: "text" },
];

function blankLoan() {
  return {
    deal_id: "NEW_DEAL",
    period: "202603",
    loan_rate: 5.5,
    upb: 10_000_000,
    origination_date: "20240101",
    loan_maturity_date: "20640101",
    lockout_end_date: "20290101",
    prepay_end_date: "20340101",
    fha_program_code: "223(F)",
    affordable_status: "MKT",
    modified_ind: "N",
    non_level_ind: "N",
    mature_loan_flag: "N",
  };
}

function LoanProjectorPanel({ loans, setLoans }) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const predictions = useMemo(
    () => loans.map((l) => predict(l, MODEL_DATA)),
    [loans]
  );

  const updRow = (i, k, v) => {
    const next = loans.map((l, idx) => (idx === i ? { ...l, [k]: v } : l));
    setLoans(next);
  };
  const delRow = (i) => setLoans(loans.filter((_, idx) => idx !== i));
  const dupRow = (i) =>
    setLoans([...loans.slice(0, i + 1), { ...loans[i] }, ...loans.slice(i + 1)]);
  const addRow = () => setLoans([...loans, blankLoan()]);
  const reset = () => setLoans(MODEL_DATA.sampleLoans);

  const exportCSV = () => {
    const rows = loans.map((l, i) => {
      const p = predictions[i];
      return {
        ...l,
        derived_age: p.derived.loan_age_months,
        derived_m2m: p.derived.months_to_maturity,
        derived_mpl: p.derived.months_post_lockout,
        derived_refi_inc: p.derived.refi_incentive_bps,
        derived_sato: p.derived.sato_bps,
        derived_pen: p.derived.prepay_penalty_points,
        predicted_smm: p.smm,
        predicted_cpr_pct: p.cpr_pct,
        ...Object.fromEntries(
          COMPONENT_KEYS.map((k) => [`attr_${k}`, p.attributions[k]])
        ),
      };
    });
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const v = r[h];
            if (v === null || v === undefined) return "";
            const s = String(v);
            return s.includes(",") || s.includes('"')
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loan_projector_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePaste = () => {
    const lines = pasteText.trim().split(/\r?\n/);
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((s) => s.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(",");
      const obj = {};
      headers.forEach((h, idx) => {
        let v = (cells[idx] ?? "").trim();
        if (v === "") v = null;
        else if (/^-?\d+(\.\d+)?$/.test(v)) v = parseFloat(v);
        obj[h] = v;
      });
      return obj;
    });
    setLoans([...loans, ...rows]);
    setPasteText("");
    setPasteOpen(false);
  };

  // Deal aggregate
  const dealSummary = useMemo(() => {
    const groups = {};
    loans.forEach((l, i) => {
      const id = l.deal_id || "(no deal)";
      if (!groups[id]) groups[id] = { id, n: 0, upb: 0, wcpr: 0, attrs: {} };
      const upb = Number(l.upb || 0);
      const cpr = predictions[i].cpr_pct;
      groups[id].n++;
      groups[id].upb += upb;
      groups[id].wcpr += cpr * upb;
      for (const k of COMPONENT_KEYS) {
        groups[id].attrs[k] = (groups[id].attrs[k] || 0) + predictions[i].attributions[k] * upb;
      }
    });
    return Object.values(groups).map((g) => ({
      ...g,
      wcpr: g.upb > 0 ? g.wcpr / g.upb : 0,
      attrs: Object.fromEntries(
        Object.entries(g.attrs).map(([k, v]) => [k, g.upb > 0 ? v / g.upb : 0])
      ),
    }));
  }, [loans, predictions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={addRow} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">+ Add row</button>
        <button onClick={reset} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 border border-slate-300">Reset to seed loans</button>
        <button onClick={exportCSV} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 border border-slate-300">Export CSV</button>
        <button onClick={() => setPasteOpen(!pasteOpen)} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 border border-slate-300">
          {pasteOpen ? "Close paste" : "Paste CSV"}
        </button>
        <span className="ml-auto text-xs text-slate-500 self-center">{loans.length} loan{loans.length === 1 ? "" : "s"}</span>
      </div>

      {pasteOpen && (
        <Card title="Paste CSV (header row required: deal_id, period, loan_rate, upb, origination_date, loan_maturity_date, lockout_end_date, prepay_end_date, fha_program_code, affordable_status)">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full h-32 border border-slate-300 rounded p-2 font-mono text-xs"
            placeholder="deal_id,period,loan_rate,upb,origination_date,loan_maturity_date,..."
          />
          <button onClick={handlePaste} className="mt-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Append rows</button>
        </Card>
      )}

      <Card title="Loan grid (yellow = input, green = derived, blue = output)">
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="py-2 px-2 w-8"></th>
                {PROJ_COLS.map((c) => (
                  <th key={c.key} className="py-2 px-1 text-left text-slate-600" style={{ minWidth: c.w }}>{c.label}</th>
                ))}
                <th className="py-2 px-1 text-right text-slate-600 bg-emerald-50">Age</th>
                <th className="py-2 px-1 text-right text-slate-600 bg-emerald-50">M2M</th>
                <th className="py-2 px-1 text-right text-slate-600 bg-emerald-50">Refi</th>
                <th className="py-2 px-1 text-right text-slate-600 bg-emerald-50">SATO</th>
                <th className="py-2 px-1 text-right text-slate-600 bg-emerald-50">Pen</th>
                <th className="py-2 px-1 text-right text-slate-600 bg-blue-50">Pred CPR</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l, i) => {
                const p = predictions[i];
                return (
                  <React.Fragment key={i}>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 px-1">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => dupRow(i)} className="text-xs text-slate-500 hover:text-blue-600" title="Duplicate">⎘</button>
                          <button onClick={() => delRow(i)} className="text-xs text-slate-400 hover:text-red-600" title="Delete">✕</button>
                        </div>
                      </td>
                      {PROJ_COLS.map((c) => (
                        <td key={c.key} className="py-1 px-1 bg-amber-50">
                          {c.type === "num" ? (
                            <NumInput value={l[c.key]} step={c.step} onChange={(v) => updRow(i, c.key, v)} />
                          ) : (
                            <TextInput value={l[c.key]} onChange={(v) => updRow(i, c.key, v)} />
                          )}
                        </td>
                      ))}
                      <td className="py-1 px-1 text-right bg-emerald-50 font-mono">{fmtNum(p.derived.loan_age_months, 0)}</td>
                      <td className="py-1 px-1 text-right bg-emerald-50 font-mono">{fmtNum(p.derived.months_to_maturity, 0)}</td>
                      <td className="py-1 px-1 text-right bg-emerald-50 font-mono">{fmtNum(p.derived.refi_incentive_bps, 0)}</td>
                      <td className="py-1 px-1 text-right bg-emerald-50 font-mono">{fmtNum(p.derived.sato_bps, 0)}</td>
                      <td className="py-1 px-1 text-right bg-emerald-50 font-mono">{fmtNum(p.derived.prepay_penalty_points, 1)}</td>
                      <td className="py-1 px-1 text-right bg-blue-50 font-mono font-semibold text-blue-800">{fmtNum(p.cpr_pct, 2)}%</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td colSpan={PROJ_COLS.length + 7} className="px-2 py-2 bg-slate-50">
                        <AttributionBar attr={p.attributions} totalCpr={p.cpr_pct} baseline={p.baseline_cpr_pct} />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Deal-level aggregation (UPB-weighted)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr className="text-slate-600">
                <th className="text-left py-2 px-2">Deal</th>
                <th className="text-right py-2 px-2">N</th>
                <th className="text-right py-2 px-2">UPB ($M)</th>
                <th className="text-right py-2 px-2">Wtd CPR</th>
                {COMPONENT_KEYS.map((k) => (
                  <th key={k} className="text-right py-2 px-1 text-xs">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dealSummary.map((g) => (
                <tr key={g.id} className="border-b border-slate-100">
                  <td className="py-2 px-2 font-mono">{g.id}</td>
                  <td className="py-2 px-2 text-right">{g.n}</td>
                  <td className="py-2 px-2 text-right">{(g.upb / 1e6).toFixed(2)}</td>
                  <td className="py-2 px-2 text-right font-semibold text-blue-700">{g.wcpr.toFixed(2)}%</td>
                  {COMPONENT_KEYS.map((k) => (
                    <td key={k} className={`py-2 px-1 text-right text-xs ${g.attrs[k] >= 0 ? "text-blue-700" : "text-red-600"}`}>
                      {g.attrs[k] >= 0 ? "+" : ""}{g.attrs[k].toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AttributionBar({ attr, totalCpr, baseline }) {
  const items = COMPONENT_KEYS
    .map((k) => ({ k, v: +attr[k].toFixed(3) }))
    .filter((d) => Math.abs(d.v) > 0.005);

  const max = Math.max(0.5, ...items.map((d) => Math.abs(d.v)));

  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-600 flex items-center gap-3">
        <span>Baseline (intercept) CPR: <b>{baseline.toFixed(3)}%</b></span>
        <span>+ component attributions =</span>
        <span>Predicted CPR: <b className="text-blue-700">{totalCpr.toFixed(2)}%</b></span>
      </div>
      <div className="grid grid-cols-13 gap-px" style={{ gridTemplateColumns: `repeat(${COMPONENT_KEYS.length}, minmax(0, 1fr))` }}>
        {COMPONENT_KEYS.map((k) => {
          const v = attr[k];
          const w = Math.min(100, (Math.abs(v) / max) * 100);
          return (
            <div key={k} className="flex flex-col items-center text-[10px] text-slate-600">
              <div className="h-10 w-full flex items-end justify-center">
                {v < 0 && <div style={{ height: `${w}%`, background: "#ef4444", width: 12 }} />}
                {v >= 0 && <div style={{ height: `${w}%`, background: COMPONENT_COLORS[k], width: 12 }} />}
              </div>
              <div className="font-mono">{k}</div>
              <div className={`font-semibold ${v >= 0 ? "text-blue-700" : "text-red-600"}`}>{v >= 0 ? "+" : ""}{v.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Feature distribution panel
// ─────────────────────────────────────────────────────────────────

function HistogramCard({ title, dist }) {
  const data = useMemo(() => {
    const out = [];
    for (let i = 0; i < dist.counts.length; i++) {
      out.push({
        bin: ((dist.edges[i] + dist.edges[i + 1]) / 2).toFixed(1),
        count: dist.counts[i],
      });
    }
    return out;
  }, [dist]);

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="bin" />
          <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
          <Tooltip formatter={(v) => v.toLocaleString()} labelFormatter={(b) => `≈ ${b}`} />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-slate-500 mt-1 grid grid-cols-3 gap-2">
        <div>min: <b>{dist.min}</b></div>
        <div>mean: <b>{dist.mean}</b></div>
        <div>max: <b>{dist.max}</b></div>
      </div>
    </Card>
  );
}

function CategoricalCard({ title, counts }) {
  const data = Object.entries(counts)
    .map(([k, v]) => ({ k: k || "(blank)", v }))
    .sort((a, b) => b.v - a.v);

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="k" />
          <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
          <Tooltip formatter={(v) => v.toLocaleString()} />
          <Bar dataKey="v" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

const DIST_TITLES = {
  refi_incentive_bps:    "Refi incentive (bps)",
  loan_age_months:       "Loan age (months)",
  prepay_penalty_points: "Penalty points",
  sato_bps:              "SATO (bps)",
  upb_millions:          "Loan UPB ($M)",
  months_to_maturity:    "Months-to-maturity",
  months_post_lockout:   "Months post-lockout",
};

function FeatureDistPanel() {
  const dist = MODEL_DATA.featureDist;
  const cats = MODEL_DATA.catCounts;
  return (
    <div>
      <div className="text-sm text-slate-600 mb-3">
        Distributions across <b>{Object.values(dist).reduce((a, d) => a + d.counts.reduce((x, y) => x + y, 0), 0).toLocaleString()}</b> eligible loan-month observations in the panel.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(dist).map(([k, d]) => (
          <HistogramCard key={k} title={DIST_TITLES[k] || k} dist={d} />
        ))}
        <CategoricalCard title="FHA category" counts={cats.fha_category} />
        <CategoricalCard title="Loan purpose" counts={cats.loan_purpose} />
        <CategoricalCard title="Affordable status" counts={cats.affordable_status} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  App shell
// ─────────────────────────────────────────────────────────────────

export default function PrepayExplorer() {
  const [tab, setTab] = useState("performance");
  const [reference, setReference] = useState({ ...MODEL_DATA.referenceLoan });
  const [loans, setLoans] = useState(MODEL_DATA.sampleLoans.map((l) => ({ ...l })));
  const [selfTest] = useState(() => runSelfTest());

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <Header meta={MODEL_DATA.meta} selfTest={selfTest} />
      <TabNav active={tab} onChange={setTab} />
      <main className="max-w-7xl mx-auto p-4">
        {tab === "performance"    && <PerformancePanel />}
        {tab === "historical_fit" && <HistoricalFitPanel />}
        {tab === "scurve"         && <SCurvePanel reference={reference} setReference={setReference} />}
        {tab === "outliers"       && <OutliersPanel />}
        {tab === "projector"      && <LoanProjectorPanel loans={loans} setLoans={setLoans} />}
        {tab === "feature_dist"   && <FeatureDistPanel />}
      </main>
      <footer className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500">
        Single-file React explorer for the GNPL voluntary prepayment model.
        Data inlined from <code>model/coefficients.csv</code>,{" "}
        <code>model/calibration.csv</code>,{" "}
        <code>model/segment_validation.csv</code>,{" "}
        <code>model/test_predictions.parquet</code>, and the full panel{" "}
        <code>gnma_mf_raw_data.parquet</code>. Regenerate the inlined{" "}
        <code>MODEL_DATA</code> object after retraining via{" "}
        <code>webapp/build_data.py</code>.
      </footer>
    </div>
  );
}
