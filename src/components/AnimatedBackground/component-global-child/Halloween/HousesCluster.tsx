import HousesDefs from './houses/HousesDefs';
import LeftVictorian from './houses/LeftVictorian';
import CenterMansion from './houses/CenterMansion';
import RightGothic from './houses/RightGothic';
import FarLeftSmall from './houses/FarLeftSmall';
import TallNarrow from './houses/TallNarrow';
import MediumWithTurret from './houses/MediumWithTurret';
import FarRightWideManor from './houses/FarRightWideManor';
import ExtraFarRightCottage from './houses/ExtraFarRightCottage';
import RightmostTiny from './houses/RightmostTiny';
import { memo } from 'react';

const HousesCluster = memo(() => (
  <div className="absolute left-0 right-0" style={{ zIndex: 6, height: 220, bottom: '80px' }}>
    <svg width="100%" height="100%" viewBox="0 0 1400 220" preserveAspectRatio="none">
      <HousesDefs />
      <LeftVictorian />
      <CenterMansion />
      <RightGothic />
      <FarLeftSmall />
      <TallNarrow />
      <MediumWithTurret />
      <FarRightWideManor />
      <ExtraFarRightCottage />
      <RightmostTiny />
    </svg>
  </div>
));

HousesCluster.displayName = 'HousesCluster';

export default HousesCluster;
