import {
  Sky,
  Moon,
  Hills,
  DistantHouses,
  Trees,
  House,
  ChristmasTree,
  Reindeer,
  Snowman,
  Gifts,
  Fence,
  Ground,
  SnowCanvas,
} from './component-global-child/Chrismas';

const ChristmasBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Canvas cho tuyết rơi */}
      <SnowCanvas />
      
      {/* Scene Giáng sinh */}
      <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 1 }}>
        {/* Nền trời đêm với sao */}
        <Sky />

        {/* Mặt trăng với hào quang */}
        <Moon />

        {/* Đồi tuyết phía sau */}
        <Hills />

        {/* Nhà xa (render trước rừng để cây che lên) */}
        <DistantHouses />

        {/* Rừng cây phía xa - 3 lớp */}
        <Trees />

        {/* Nhà gỗ với lò sưởi */}
        <House />

        {/* Cây thông Noel lớn */}
        <ChristmasTree />

        {/* Tuần lộc */}
        <Reindeer />

        {/* Người tuyết */}
        <Snowman />

        {/* Hộp quà */}
        <Gifts />

        {/* Hàng rào tuyết */}
        <Fence />

        {/* Tuyết phủ mặt đất với chi tiết */}
        <Ground />
      </div>
    </div>
  );
};

export default ChristmasBackground;
