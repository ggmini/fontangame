/** Interface for missions */
export interface Mission {

    /** Whether the mission is completed or not */
    IsCompleted: boolean; 
    /** The Point Reward for completing the mission */
    Reward: number;

    /** Tick logic to check for mission completion */
    checkCompletion(): void;


}