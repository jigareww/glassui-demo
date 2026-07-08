require 'xcodeproj'
project_path = 'ios/ReactNativeStarter.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first

# The path to the group in Xcode
group_path = 'ReactNativeStarter'
group = project.main_group.find_subpath(group_path, false)
raise "Group #{group_path} not found" unless group

resources_build_phase = target.resources_build_phase

# List of new icon base names to add
icons = [
  'diwali-gold', 'christmas-gold', 'holi', 'holi-gold', 
  'halloween', 'halloween-gold', 'newyear', 'newyear-gold'
]

icons.each do |icon|
  ['@2x', '@3x'].each do |scale|
    file_name = "#{icon}#{scale}.png"
    file_path = "ios/ReactNativeStarter/Icons/#{file_name}"
    
    # Check if already added
    next if group.files.any? { |f| f.path == "Icons/#{file_name}" }

    file_ref = group.new_reference("Icons/#{file_name}")
    file_ref.source_tree = 'SOURCE_ROOT'
    resources_build_phase.add_file_reference(file_ref)
    puts "Added #{file_name} to project"
  end
end

project.save
puts "Successfully updated project.pbxproj"
