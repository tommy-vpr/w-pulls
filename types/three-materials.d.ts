import { ReactThreeFiber } from "@react-three/fiber";
import { HolographicMaterial } from "@/components/packs/shaders/holographic";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      holographicMaterial: ReactThreeFiber.Object3DNode<
        typeof HolographicMaterial,
        typeof HolographicMaterial
      >;
    }
  }
}
