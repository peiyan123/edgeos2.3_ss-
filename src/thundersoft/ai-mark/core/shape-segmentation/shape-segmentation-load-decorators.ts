import { AiMarkInterface } from '..';
import { ShapeSegmentationData } from './index';

/**
 * ShapeSegmentationLoadDecorators
 */
export function ShapeSegmentationLoadDecorators<T extends new (...args: any[]) => AiMarkInterface>(
  constructor: T,
) {
  return class extends constructor {
    /**
     * @override 方法重写 super.init
     * @param el
     * @param url
     * @param args
     */
    init(el: HTMLElement, ...args: any[]): any {
      const result = super.init(el, ...args);
      return { ...result };
    }
    /**
     * 加载图形数据
     * @param shap
     */
    loadShapeSegmentation?(shap: ShapeSegmentationData[]): void {
      this.shapeSegmentations!.length = 0;
      shap.forEach((shapConfig) => {
        // 计算 labelCole
        shapConfig.labelColor = this.getLabelCole!(shapConfig.color!);
        // 图形id
        shapConfig.shapeId =
          shapConfig.shapeId ||
          'shapPoint:' + new Date().getTime() + Math.round(Math.random() * 10000);
        // 加载图形的点
        shapConfig.point = shapConfig.pointSource!.map((source) => ({
          invalid: true,
          id: Symbol('PointId'),
          source: {
            ...source,
            color: shapConfig.color,
            labelColor: shapConfig.labelColor,
            shapeId: shapConfig.shapeId,
          },
        }));
        this.pointsMap?.set(shapConfig.shapeId, shapConfig.point!);
        // 加入集合
        this.shapeSegmentations!.push({
          ...shapConfig,
          shapeId: shapConfig.shapeId,
        });
      });
    }

    /**
     * 加载多边形图形数据
     * @param shap
     */
    loadShapeSegmentationElse?(shap: ShapeSegmentationData[]): void {
      this.shapeSegmentations!.length = 0;
      shap.forEach((shapConfig) => {
        // 计算 labelCole
        shapConfig.labelColor = this.getLabelCole!(shapConfig.color!);
        shapConfig.type = 'polygon';
        // 图形id
        shapConfig.shapeId =
          shapConfig.shapeId ||
          'shapPoint:' + new Date().getTime() + Math.round(Math.random() * 10000);
        // 加载图形的点
        shapConfig.point = shapConfig.pointSource!.map((source) => {
          return {
            invalid: true,
            id: Symbol('PointId'),
            source: {
              ...source,
              color: shapConfig.color,
              labelColor: shapConfig.labelColor,
              shapeId: shapConfig.shapeId,
            },
          };
        });

        setTimeout(() => {
          shapConfig.point!.forEach((item: any) => {
            item.source.x = RatioCalculation(
              item.source.x - this.imageStartPoint!.x,
              this.canvasZoom,
              this.accuracy,
            );
            item.source.y = RatioCalculation(
              item.source.y - this.imageStartPoint!.y,
              this.canvasZoom,
              this.accuracy,
            );
          });
          this.pointsMap.set(shapConfig.shapeId, shapConfig.point!);
          // 加入集合
          this.shapeSegmentations!.push({
            ...shapConfig,
            shapeId: shapConfig.shapeId,
          });
        }, 100);
      });
    }
  };
}
